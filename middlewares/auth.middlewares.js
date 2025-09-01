import jwt from "jsonwebtoken";
import { responseData } from "../utils/respounse.js";
import registerModel from "../models/usersModels/register.model.js";
import projectModel from "../models/adminModels/project.model.js";
import fileuploadModel from "../models/adminModels/fileuploadModel.js";
import { notificationForUser } from "../controllers/notification/notification.controller.js";
import cron from "node-cron";
import leadModel from "../models/adminModels/leadModel.js";
import taskModel from "../models/adminModels/task.model.js";
import leadTaskModel from "../models/adminModels/leadTask.model.js";
import openTaskModel from "../models/adminModels/openTask.model.js";
import { filterTasks } from "../utils/filterTasks.js";

// Middleware to verify JWT and set user in req
export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.auth || req.header("Authorization")?.replace("Bearer", "").trim();
    if (!token) {
      return responseData(res, "", 401, false, "Unauthorized: No token provided");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await registerModel.findById(decodedToken?.id);

    if (!user) {
      return responseData(res, "", 401, false, "Unauthorized: User not found");
    }

    if (user.status === false) {
      return responseData(res, "", 401, false, "Unauthorized: User is not active");
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Error in verifyJWT:", err);
    return responseData(res, "", 401, false, "Unauthorized: Invalid token");
  }
};

// Middleware to check if the user is an admin
// Ensure you import cron if not already done

export const checkAvailableUserIsAdmin = async (req, res, next) => {
  try {
    const user = req.user; // Access user from req object

    // Check if the user has an admin role
    if (['ADMIN', 'Senior Architect', 'ORGADMIN', 'SUPERADMIN'].includes(user.role)) {
      return next();
    }

    // Extract pagination parameters
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page if not provided

    // Fetch notifications data for the user with pagination
    const notifications = user.data[0]?.notificationData || [];
    const totalNotifications = notifications.length;
    const totalPages = Math.ceil(totalNotifications / limit);
    const paginatedNotifications = notifications.slice((page - 1) * limit, page * limit);

    // Schedule a cron job to send a notification at midnight
    cron.schedule("0 0 * * *", async () => {
      try {
        await notificationForUser(req, res, user.username, user.organization);
        console.log("Notification cron job executed successfully");
      } catch (error) {
        console.error("Error executing notification cron job:", error);
      }
    });

    // Prepare response data
    const response = {
      NotificationData: paginatedNotifications, // Return only the paginated data
      pagination: {
        totalNotifications,
        totalPages,
        currentPage: page,
        limit,
      },
    };

    return responseData(res, "User data found", 200, true, "", response);

  } catch (err) {
    console.error("Error in checkAvailableUserIsAdmin:", err);
    return responseData(res, "", 403, false, "Unauthorized: Invalid token");
  }
};


export const checkAvailableUserIsAdminInFile = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if the user has admin roles
    if (['ADMIN', 'Senior Architect', 'ORGADMIN', 'SUPERADMIN'].includes(user.role)) {
      return next();
    }

    // Collect user-related project and lead IDs
    const projectIds = user.data[0].projectData.map(item => item.project_id);
    const leadIds = user.data[0].leadData.map(item => item.lead_id);

    // Fetch related projects, files, leads, and lead files concurrently
    const [projects, projectFiles, leads, leadFiles] = await Promise.all([
      projectModel.find({ project_id: { $in: projectIds } })
        .select('project_name project_id client project_type project_status')
        .lean(),
      fileuploadModel.find({ project_id: { $in: projectIds } })
        .select('project_id files')
        .lean(),
      leadModel.find({ lead_id: { $in: leadIds } })
        .select('lead_id name email phone status date')
        .lean(),
      fileuploadModel.find({ lead_id: { $in: leadIds } })
        .select('lead_id files')
        .lean(),
    ]);

    // Create Maps for fast lookup of files by project_id and lead_id
    const projectFilesMap = new Map(projectFiles.map(file => [file.project_id, file.files]));
    const leadFilesMap = new Map(leadFiles.map(file => [file.lead_id, file.files]));

    // Prepare project data
    const projectData = projects.map(project => ({
      project_name: project.project_name,
      project_id: project.project_id,
      client_name: project.client[0]?.client_name,
      project_type: project.project_type,
      project_status: project.project_status,

    }));

    // Prepare lead data
    const leadData = leads.map(lead => ({
      lead_id: lead.lead_id,
      lead_name: lead.name,
      lead_email: lead.email,
      lead_status: lead.status,
      lead_date: lead.date,

    }));

    // Prepare and send response data
    const response = {
      projectData,
      leadData,
    };

    return responseData(res, "User data found", 200, true, "", response);
  } catch (err) {
    console.error("Error in checkAvailableUserIsAdminInFile:", err);
    return responseData(res, "", 403, false, "Unauthorized: Invalid token");
  }
};



export const checkAvailableUserIsAdminInLead = async (req, res, next) => {
  try {

    const { role, data } = req.user;

    // If user has admin privileges, proceed to the next middleware
    if (['ADMIN', 'Senior Architect', 'ORGADMIN', 'SUPERADMIN'].includes(role)) {
      return next();
    }

    // If user is not an admin, retrieve the related leads
    const leadIds = data?.[0]?.leadData.map(item => item.lead_id) || [];

    // Fetch the leads in a single query
    const leads = await leadModel.find({ lead_id: { $in: leadIds } }).lean();
    const formattedLeads = await Promise.all(leads.map(async (lead) => {
      const leadDetails = lead.lead_details?.[0] || {};

      const count_task = await leadTaskModel.countDocuments({ lead_id: lead.lead_id });
      console.log(lead)

      return {
        name: leadDetails.name || lead.name,
        lead_id: lead.lead_id,
        email: leadDetails.email || lead.email,
        phone: leadDetails.phone ||  lead.phone,
        location: leadDetails.location || lead.location,
        status: leadDetails.status || lead.status,
        lead_status: lead.lead_status,
        date: leadDetails.date || lead.date,
        count_task,
        hasPendingContract: Array.isArray(lead.contract)
          ? lead.contract.some(item => item.admin_status === "pending")
          : false,

      }
    }));

    // Return the leads in the response
    return responseData(res, "User data found", 200, true, "", { leads: formattedLeads.reverse() });
  } catch (err) {
    console.error("Error in checkAvailableUserIsAdminInLead:", err);
    return responseData(res, "", 403, false, "Unauthorized: Invalid token");
  }
};



export const checkAvailableUserIsAdmininProject = async (req, res, next) => {
  try {
    const { role, data } = req.user;

    // If user has admin privileges, proceed to the next middleware
    if (['ADMIN', 'Senior Architect', 'ORGADMIN', 'SUPERADMIN'].includes(role)) {
      return next();
    }

    // Get project IDs related to the user
    const projectIds = data?.[0]?.projectData.map(item => item.project_id) || [];

    // Fetch projects in a single query
    const projects1 = await projectModel.find({ project_id: { $in: projectIds } }).lean();



    const projectData = await Promise.all(projects1.map(async (project) => {
      const count_task = await taskModel.countDocuments({ project_id: project.project_id });
      const {
        project_id, project_name, project_status, status, project_start_date, project_end_date, project_type, designer, client,
      } = project;

      return {
        project_id,
        project_name,
        project_status,
        status, // Include Active/Inactive status
        project_start_date,
        project_end_date,
        client_name: client[0]?.client_name || "",
        project_type,
        designer,
        client,
        count_task: count_task
      };
    }));
    // console.log(projectData)
    // Categorize projects by status
    const categorizedProjects = projects1.reduce(
      (acc, project) => {
        const projectItem = {
          project_name: project.project_name,
          project_id: project.project_id,
          client_name: project.client?.[0]?.client_name || '',
          project_type: project.project_type,
          project_status: project.project_status,
        };

        switch (project.project_status) {
          case "executing":
            acc.execution.push(projectItem);
            break;
          case "designing":
            acc.design.push(projectItem);
            break;
          case "completed":
            acc.completed.push(projectItem);
            break;
          case "design & execution":
            acc.design_execution.push(projectItem);
          default:
            break;
        }
        switch (project.project_type) {
          case "residential":
            acc.residential.push(projectItem);
            break;
          case "commercial":
            acc.commercial.push(projectItem);
            break;
          default:
            break;
        }

        return acc;
      },
      { execution: [], design: [], completed: [], residential: [], commercial: [], design_execution: [] }
    );

    const totalProjects = projects1.length;
    const completedProjects = categorizedProjects.completed.length;
    const response = {
      total_Project: totalProjects,
      Execution_Phase: categorizedProjects.execution.length,
      Design_Phase: categorizedProjects.design.length,
      Design_Execution: categorizedProjects.design_execution.length,
      residential: ((categorizedProjects.residential.length / totalProjects) * 100).toFixed(2),
      commercial: ((categorizedProjects.commercial.length / totalProjects) * 100).toFixed(2),
      completed: completedProjects,
      active_Project: totalProjects - completedProjects,
      projects: projectData,
    };

    return responseData(res, "User not found", 200, true, "", response);
  } catch (err) {
    console.error("Error in checkAvailableUserIsAdmininProject:", err);
    return responseData(res, "", 500, false, "Internal Server Error");
  }
};

export const checkAvailableUserIsAdmininProjectByLeadid = async (req, res, next) => {
  try {
    const { role, data } = req.user;

    // If user has admin privileges, proceed to the next middleware
    if (['ADMIN', 'Senior Architect', 'ORGADMIN', 'SUPERADMIN'].includes(role)) {
      return next();
    }

    // Get project IDs related to the user
    // const projectIds = data?.[0]?.projectData.map(item => item.project_id) || [];

    // // Fetch projects in a single query
    // const projects1 = await projectModel.find({ project_id: { $in: projectIds } }).lean();



    // const projectData =  await Promise.all (projects1.map(async (project) => {
    //   const count_task = await taskModel.countDocuments({ project_id: project.project_id });
    //   const {
    //     project_id, project_name, project_status, project_start_date, project_end_date, project_type, designer, client,
    //   } = project;

    //   return {
    //     project_id,
    //     project_name,
    //     project_status,
    //     project_start_date,
    //     project_end_date,
    //     client_name: client[0]?.client_name || "",
    //     project_type,
    //     designer,
    //     client,
    //     count_task: count_task
    //   };
    // }));
    // // console.log(projectData)
    // // Categorize projects by status
    // const categorizedProjects = projects1.reduce(
    //   (acc, project) => {
    //     const projectItem = {
    //       project_name: project.project_name,
    //       project_id: project.project_id,
    //       client_name: project.client?.[0]?.client_name || '',
    //       project_type: project.project_type,
    //       project_status: project.project_status,
    //     };

    //     switch (project.project_status) {
    //       case "executing":
    //         acc.execution.push(projectItem);
    //         break;
    //       case "designing":
    //         acc.design.push(projectItem);
    //         break;
    //       case "completed":
    //         acc.completed.push(projectItem);
    //         break;
    //       case "design & execution":
    //         acc.design_execution.push(projectItem);
    //       default:
    //         break;
    //     }
    //     switch (project.project_type) {
    //       case "residential":
    //         acc.residential.push(projectItem);
    //         break;
    //       case "commercial":
    //         acc.commercial.push(projectItem);
    //         break;
    //       default:
    //         break;
    //     }

    //     return acc;
    //   },
    //   { execution: [], design: [], completed: [], residential: [], commercial: [], design_execution: [] }
    // );

    // const totalProjects = projects1.length;
    // const completedProjects = categorizedProjects.completed.length;
    // const response = {
    //   total_Project: totalProjects,
    //   Execution_Phase: categorizedProjects.execution.length,
    //   Design_Phase: categorizedProjects.design.length,
    //   Design_Execution: categorizedProjects.design_execution.length,
    //   residential: ((categorizedProjects.residential.length / totalProjects) * 100).toFixed(2),
    //   commercial: ((categorizedProjects.commercial.length / totalProjects) * 100).toFixed(2),
    //   completed: completedProjects,
    //   active_Project: totalProjects - completedProjects,
    //   projects: projectData,
    // };

    return responseData(res, "You are not a ADMIN, SUPERADMIN, Senior Architect", 401, true, "", response);
  } catch (err) {
    console.error("Error in checkAvailableUserIsAdmininProject:", err);
    return responseData(res, "", 500, false, "Internal Server Error");
  }
};

export const checkOpenTaskReadAccess = async (req, res, next) => {
  try {
    const { role } = req.user;

    const org_id = req.query.org_id;
    const user_id = req.query.user_id;
    const task_assignee = req.query.task_assignee;
    const task_priority = req.query.task_priority;
    const task_status = req.query.task_status;

    const token = req.cookies?.auth ||
      req.header("Authorization")?.replace("Bearer", "").trim();

    if (!token) {
      return responseData(
        res,
        "",
        403,
        false,
        "Unauthorized: No token provided"
      );
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await registerModel.findById(decodedToken?.id);

    if (!user) {
      return responseData(res, "", 403, false, "Unauthorized: User not found");
    }

    const opentaskReadAccess = user.access?.opentask?.includes('read')
    const leadtaskReadAccess = user.access?.leadtask?.includes('read')
    const projecttaskReadAccess = user.access?.task?.includes('read')

    // If user has admin privileges, proceed to the next middleware
    if (['ADMIN', 'Senior Architect', 'ORGADMIN', 'SUPERADMIN'].includes(role)) {
      return next();
    }
    else {

      // Declare arrays to store the tasks based on permissions
      let projectTasks = [];
      let leadTasks = [];
      let openTasks = [];

      // Fetch data based on permissions
      if (projecttaskReadAccess) {
        projectTasks = await taskModel.find({ org_id });
      }

      if (leadtaskReadAccess) {
        leadTasks = await leadTaskModel.find({ org_id });
      }

      if (opentaskReadAccess) {
        openTasks = await openTaskModel.find({ org_id });
      }

      // Fetch related data only if the user has access to the relevant task type
      const [projects, leads] = await Promise.all([
        projecttaskReadAccess ? projectModel.find({ org_id, project_id: { $in: projectTasks.map(task => task.project_id) } }) : [],
        leadtaskReadAccess ? leadModel.find({ org_id, lead_id: { $in: leadTasks.map(task => task.lead_id) } }) : [],
      ]);

      // Map project tasks
      const projectTaskDetails = projectTasks.map(task => {
        const project = projects.find(p => p.project_id === task.project_id);
        return {
          project_id: task.project_id,
          name: project ? project.project_name : "Unknown",
          type: "project type",
          task_id: task.task_id,
          org_id: task.org_id,
          task_name: task.task_name,
          task_status: task.task_status,
          task_priority: task.task_priority,
          task_assignee: task.task_assignee,
          task_start_date: task.estimated_task_start_date,
          task_end_date: task.estimated_task_end_date
        };
      });

      // Map lead tasks
      const leadTaskDetails = leadTasks.map(task => {
        const lead = leads.find(l => l.lead_id === task.lead_id);
        return {
          lead_id: task.lead_id,
          name: lead ? lead.name : "Unknown",
          type: "lead type",
          task_id: task.task_id,
          org_id: task.org_id,
          task_name: task.task_name,
          task_status: task.task_status,
          task_priority: task.task_priority,
          task_assignee: task.task_assignee,
          task_start_date: task.estimated_task_start_date,
          task_end_date: task.estimated_task_end_date
        };
      });

      // Map open tasks
      const openTaskDetails = openTasks.map(task => {
        return {
          name: "Unknown",
          type: "open type",
          task_id: task.task_id,
          org_id: task.org_id,
          task_name: task.task_name,
          task_status: task.task_status,
          task_priority: task.task_priority,
          task_assignee: task.task_assignee,
          task_start_date: task.estimated_task_start_date,
          task_end_date: task.estimated_task_end_date
        };
      });

      // Combine all tasks based on permissions
      const allTasks = [
        ...projecttaskReadAccess ? projectTaskDetails : [],
        ...leadtaskReadAccess ? leadTaskDetails : [],
        ...opentaskReadAccess ? openTaskDetails : []
      ];

      // Apply additional filters if provided
      const filterConditions = {};
      if (task_assignee) filterConditions.task_assignee = task_assignee;
      if (task_status) filterConditions.task_status = task_status;
      if (task_priority) filterConditions.task_priority = task_priority;

      const filteredTasks = filterTasks(allTasks, filterConditions);

      // Return filtered tasks in the response
      return responseData(res, "All tasks fetched successfully", 200, true, "", filteredTasks);




    }


  } catch (err) {
    console.error("Error in checkOPenTaskReadAccess:", err);
    return responseData(res, "", 500, false, "Internal Server Error");
  }
};


export const checkAvailableUserIsAdminInMom = async (req, res, next) => {
  try {
    const { role, data } = req.user;

    // If user has admin privileges, proceed to the next middleware
    if (['ADMIN', 'Senior Architect', 'ORGADMIN', 'SUPERADMIN'].includes(role)) {
      return next();
    }

    // Get project IDs related to the user
    const projectIds = data?.[0]?.projectData.map(item => item.project_id) || [];

    // Fetch projects and their associated data in a single query
    const projects = await projectModel.find({ project_id: { $in: projectIds } }).lean();

    // Extract MOM data from the projects
    const MomData = projects.flatMap(project =>
      project.mom.map(mom => ({
        project_id: project.project_id,
        project_name: project.project_name,
        mom_id: mom.mom_id,
        client_name: project.client?.[0]?.client_name || '',
        location: mom.location,
        meetingDate: mom.meetingdate,
      }))
    );

    const response = { MomData };

    return responseData(res, "User data found", 200, true, "", response);
  } catch (err) {
    console.error("Error in checkAvailableUserIsAdminInMom:", err);
    return responseData(res, "", 500, false, "Internal Server Error");
  }
};

// Middleware to check if the user has an admin role
export const isAdmin = (req, res, next) => {
  try {
    const user = req.user; // Access user from req object

    if (['ADMIN', 'Senior Architect', 'ORGADMIN', 'SUPERADMIN'].includes(user.role)) {
      return next(); // Proceed to the next middleware
    } else {
      return responseData(res, "", 403, false, "Unauthorized: You are not able to access");
    }
  } catch (err) {
    console.error("Error in isAdmin:", err);
    return responseData(res, "", 403, false, "Unauthorized: Invalid token");
  }
};
