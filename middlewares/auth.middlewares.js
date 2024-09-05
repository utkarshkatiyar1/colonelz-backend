import jwt from "jsonwebtoken";
import { responseData } from "../utils/respounse.js";
import registerModel from "../models/usersModels/register.model.js";
import projectModel from "../models/adminModels/project.model.js";
import fileuploadModel from "../models/adminModels/fileuploadModel.js";
import { notificationForUser } from "../controllers/notification/notification.controller.js";
import cron from "node-cron";
import leadModel from "../models/adminModels/leadModel.js";

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

    req.user = user; // Store user in req object
    next(); // Proceed to the next middleware
  } catch (err) {
    console.error("Error in verifyJWT:", err);
    return responseData(res, "", 401, false, "Unauthorized: Invalid token");
  }
};

// Middleware to check if the user is an admin
export const checkAvailableUserIsAdmin = async (req, res, next) => {
  try {
    const user = req.user; // Access user from req object

    // Check if the user has an admin role
    if (['ADMIN', 'Senior Architect', 'ORGADMIN', 'SUPERADMIN'].includes(user.role)) {
      return next();
    }

    // Schedule a cron job to send a notification at midnight
    cron.schedule("0 0 * * *", async () => {
      try {
        await notificationForUser(req, res, user.username);
        console.log("Notification cron job executed successfully");
      } catch (error) {
        console.error("Error executing notification cron job:", error);
      }
    });

    // Prepare response data
    const response = {
      NotificationData: user.data[0]?.notificationData || [],  // Use optional chaining to avoid potential errors
    };

    return responseData(res, "User data found", 200, true, "", response);
  } catch (err) {
    console.error("Error in checkAvailableUserIsAdmin:", err);
    return responseData(res, "", 401, false, "Unauthorized: Invalid token");
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
    return responseData(res, "", 401, false, "Unauthorized: Invalid token");
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
    const formattedLeads = leads.map(lead => ({
      name: lead.name,
      lead_id: lead.lead_id,
      email: lead.email,
      phone: lead.phone,
      location: lead.location,
      status: lead.status,
      date: lead.date
    }));

    // Return the leads in the response
    return responseData(res, "User data found", 200, true, "", { leads: formattedLeads });
  } catch (err) {
    console.error("Error in checkAvailableUserIsAdminInLead:", err);
    return responseData(res, "", 401, false, "Unauthorized: Invalid token");
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

    const projectData = projects1.map((project) => {
      const {
        project_id,
        project_name,
        project_status,
        project_start_date,
        project_end_date,
        project_type,
        designer,
        client,
      } = project;

      return {
        project_id,
        project_name,
        project_status,
        project_start_date,
        project_end_date,
        client_name: client[0]?.client_name || "",
        project_type,
        designer,
        client,
      };
    });
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
      { execution: [], design: [], completed: [],residential:[], commercial:[], design_execution:[]}
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

    return responseData(res, "User data found", 200, true, "", response);
  } catch (err) {
    console.error("Error in checkAvailableUserIsAdmininProject:", err);
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
      return responseData(res, "", 401, false, "Unauthorized: You are not able to access");
    }
  } catch (err) {
    console.error("Error in isAdmin:", err);
    return responseData(res, "", 401, false, "Unauthorized: Invalid token");
  }
};
