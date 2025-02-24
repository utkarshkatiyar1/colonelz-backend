import projectModel from "../../../models/adminModels/project.model.js";
import { responseData } from "../../../utils/respounse.js";

import dotenv from "dotenv";
import registerModel from "../../../models/usersModels/register.model.js";
import {
  onlyAlphabetsValidation,
  onlyEmailValidation,
  onlyPhoneNumberValidation,
} from "../../../utils/validation.js";
import notificationModel from "../../../models/adminModels/notification.model.js";
import taskModel from "../../../models/adminModels/task.model.js";
import orgModel from "../../../models/orgmodels/org.model.js";
import leadModel from "../../../models/adminModels/leadModel.js";
import { createOrUpdateTimeline } from "../../../utils/timeline.utils.js";
dotenv.config();
function generateSixDigitNumber() {
  const min = 100000;
  const max = 999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber;
}


function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}



// Function to check if the project is older than 6 months
function isProjectOlderThan6Months(createdDate) {
  // Get the current date
  const currentDate = new Date();

  // Calculate the difference in months
  const diffMonths =
    (currentDate.getFullYear() - createdDate.getFullYear()) * 12 +
    (currentDate.getMonth() - createdDate.getMonth());

  // Check if the difference is greater than or equal to 6 months
  return diffMonths >= 6;
}

// Example usage

export const getAllProject = async (req, res) => {
  try {
    const id = req.query.id;
    const org_id = req.query.org_id;

    if (!id) {
      return responseData(res, "", 400, false, "User ID is required");
    }
    if (!org_id) {
      return responseData(res, "", 400, false, "Org ID is required", []);
    }

    const user = await registerModel.findById(id);
    if (!user) {
      return responseData(res, "", 404, false, "User not found");
    }
    const check_org = await orgModel.findOne({ _id: org_id })
    if (!check_org) {
      return responseData(res, "", 404, false, "Org not found");
    }

    // Use aggregation to count and categorize projects in one go
    const projects = await projectModel.aggregate([
      // Match projects belonging to the specified org_id
      { $match: { org_id: org_id } },
      // Lookup tasks related to each project
      {
        $lookup: {
          from: "task", // Name of the task collection
          localField: "project_id",
          foreignField: "project_id",
          as: "task",
        },
      },
      // Add task count for each project
      {
        $addFields: {
          count_task: { $size: "$task" }, // Count the number of tasks
        },
      },
      // Project necessary fields
      {
        $project: {
          project_id: 1,
          project_name: 1,
          project_status: 1,
          project_start_date: 1,
          project_end_date: 1,
          project_type: 1,
          designer: 1,
          client_name: { $arrayElemAt: ["$client.client_name", 0] },
          client: 1,
          count_task: 1, // Include task count
        },
      },
      // Group projects for summary statistics
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          execution: { $sum: { $cond: [{ $eq: ["$project_status", "executing"] }, 1, 0] } },
          design: { $sum: { $cond: [{ $eq: ["$project_status", "designing"] }, 1, 0] } },
          designAndExecution: { $sum: { $cond: [{ $eq: ["$project_status", "design & execution"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$project_status", "completed"] }, 1, 0] } },
          commercial: { $sum: { $cond: [{ $eq: ["$project_type", "commercial"] }, 1, 0] } },
          residential: { $sum: { $cond: [{ $eq: ["$project_type", "residential"] }, 1, 0] } },
          projectsData: { $push: "$$ROOT" },
        },
      },
      // Calculate percentages and project the final structure
      {
        $project: {
          totalProjects: 1,
          execution: 1,
          design: 1,
          designAndExecution: 1,
          completed: 1,
          commercial: { $multiply: [{ $divide: ["$commercial", "$totalProjects"] }, 100] },
          residential: { $multiply: [{ $divide: ["$residential", "$totalProjects"] }, 100] },
          projectsData: 1,
        },
      },
    ]);
    

    if (!projects.length) {
      return responseData(res, "", 200, true, "No projects found");
    }

    const archive = projects[0].projectsData.filter(p => isProjectOlderThan6Months(p.project_end_date)).length;
    const activeProjects = projects[0].totalProjects - projects[0].completed;

    const response = {
      total_Project: projects[0].totalProjects,
      Execution_Phase: projects[0].execution,
      Design_Phase: projects[0].design,
      Design_Execution: projects[0].designAndExecution,
      completed: projects[0].completed,
      commercial: projects[0].commercial.toFixed(2),
      residential: projects[0].residential.toFixed(2),
      archive,
      active_Project: activeProjects,
      projects: projects[0].projectsData.reverse(),
      count_task: projects[0].count_task,
    };

    responseData(res, "Projects fetched successfully", 200, true, "", response);
  } catch (error) {
    console.error(error.message); // Log the error for debugging
    responseData(res, "", 500, false, "Error in fetching projects");
  }
};


export const getAllProjectByLeadId = async (req, res) => {
  try {
    const id = req.query.id;
    const org_id = req.query.org_id;
    const lead_id = req.query.lead_id;

    if (!id) {
      return responseData(res, "", 400, false, "User ID is required");
    }
    if (!org_id) {
      return responseData(res, "", 400, false, "Org ID is required", []);
    }
    if (!lead_id) {
      return responseData(res, "", 400, false, "Lead ID is required");
    }

    const user = await registerModel.findById(id);
    if (!user) {
      return responseData(res, "", 404, false, "User not found");
    }

    const check_org = await orgModel.findOne({ _id: org_id });
    if (!check_org) {
      return responseData(res, "", 404, false, "Org not found");
    }

    const leadData = await leadModel.findOne({ lead_id });
    if (!leadData) {
      return responseData(res, "", 404, false, "Lead not found");
    }

    // **Aggregation to filter projects by lead_id and count tasks**
    const projects = await projectModel.aggregate([
      // Match projects belonging to the specified org_id and lead_id
      { $match: { org_id: org_id, lead_id: lead_id } },

      // Lookup tasks related to each project
      {
        $lookup: {
          from: "task", // Task collection
          localField: "project_id",
          foreignField: "project_id",
          as: "task",
        },
      },

      // Add task count for each project
      {
        $addFields: {
          count_task: { $size: "$task" }, // Count the number of tasks
        },
      },

      // Project necessary fields
      {
        $project: {
          project_id: 1,
          project_name: 1,
          project_status: 1,
          project_start_date: 1,
          project_end_date: 1,
          project_type: 1,
          designer: 1,
          client_name: { $arrayElemAt: ["$client.client_name", 0] },
          client: 1,
          count_task: 1, // Include task count
        },
      },

      // Group projects for summary statistics
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          execution: { $sum: { $cond: [{ $eq: ["$project_status", "executing"] }, 1, 0] } },
          design: { $sum: { $cond: [{ $eq: ["$project_status", "designing"] }, 1, 0] } },
          designAndExecution: { $sum: { $cond: [{ $eq: ["$project_status", "design & execution"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$project_status", "completed"] }, 1, 0] } },
          commercial: { $sum: { $cond: [{ $eq: ["$project_type", "commercial"] }, 1, 0] } },
          residential: { $sum: { $cond: [{ $eq: ["$project_type", "residential"] }, 1, 0] } },
          projectsData: { $push: "$$ROOT" },
        },
      },

      // Calculate percentages and project the final structure
      {
        $project: {
          totalProjects: 1,
          execution: 1,
          design: 1,
          designAndExecution: 1,
          completed: 1,
          commercial: { $multiply: [{ $divide: ["$commercial", "$totalProjects"] }, 100] },
          residential: { $multiply: [{ $divide: ["$residential", "$totalProjects"] }, 100] },
          projectsData: 1,
        },
      },
    ]);

    if (!projects.length) {
      return responseData(res, "", 200, true, "No projects found for the given Lead ID");
    }

    const archive = projects[0].projectsData.filter(p => isProjectOlderThan6Months(p.project_end_date)).length;
    const activeProjects = projects[0].totalProjects - projects[0].completed;

    const response = {
      total_Project: projects[0].totalProjects,
      Execution_Phase: projects[0].execution,
      Design_Phase: projects[0].design,
      Design_Execution: projects[0].designAndExecution,
      completed: projects[0].completed,
      commercial: projects[0].commercial.toFixed(2),
      residential: projects[0].residential.toFixed(2),
      archive,
      active_Project: activeProjects,
      projects: projects[0].projectsData.reverse(),
    };

    responseData(res, "Projects fetched successfully", 200, true, "", response);
  } catch (error) {
    console.error(error.message);
    responseData(res, "", 500, false, "Error in fetching projects");
  }
};



export const getSingleProject = async (req, res) => {
  const { project_id, id, org_id } = req.query;
  

  if (!project_id) {
    return responseData(res, "", 400, false, "Project ID is required.", []);
  }

  if (!id) {
    return responseData(res, "", 400, false, "User ID is required.", []);
  }
  if(!org_id)
  {
    return responseData(res, "", 400, false, "Org ID is required.", []);
  }
  try {
    const check_org = await orgModel.findOne({ _id: org_id })
    if (!check_org) {
      return responseData(res, "", 404, false, "Org not found");
    }
    // Fetch the user and project in parallel
    const [user, project] = await Promise.all([
      registerModel.findOne({_id:id, organization:org_id}).lean(), // Use lean to get plain JavaScript objects
      projectModel.findOne({ project_id , org_id:org_id}).lean(),
    ]);

    if (!user) {
      return responseData(res, "", 404, false, "User not found.", []);
    }

    if (!project) {
      return responseData(res, "", 404, false, "Project not found.", []);
    }

    // Use aggregation to get task metrics directly from the database
    const taskMetrics = await taskModel.aggregate([
      { $match: { project_id, org_id } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: { $sum: { $cond: [{ $eq: ["$task_status", "Completed"] }, 1, 0] } },
          cancelledTasks: { $sum: { $cond: [{ $eq: ["$task_status", "Cancelled"] }, 1, 0] } },
        }
      },
    ]);

    const totalTasks = taskMetrics.length > 0 ? taskMetrics[0].totalTasks : 0;
    const completedTasks = taskMetrics.length > 0 ? taskMetrics[0].completedTasks : 0;
    const cancelledTasks = taskMetrics.length > 0 ? taskMetrics[0].cancelledTasks : 0;
    const percentage = totalTasks > 0 ? (completedTasks / (totalTasks - cancelledTasks)) * 100 : 0;

    // Construct response
    const response = {
      project_id: project.project_id,
      project_name: project.project_name,
      project_type: project.project_type,
      project_status: project.project_status,
      timeline_date: project.timeline_date,
      project_budget: project.project_budget,
      description: project.description,
      designer: project.designer,
      client: project.client,
      lead_id: project.lead_id,
      visualizer: project.visualizer,
      leadmanager: project.leadmanager,
      project_start_date: project.project_start_date,
      project_end_date: project.project_end_date,
      project_location: project.project_location,
      percentage: percentage
    };

    responseData(res, "Project found", 200, true, "", [response]);
  } catch (err) {
    console.error(err); // Log the error for debugging
    responseData(res, "", 400, false, "Error fetching project", err);
  }
};




export const updateProjectDetails = async (req, res) => {
  const project_ID = req.body.project_id;
  const project_status = req.body.project_status;
  const timeline_date = req.body.timeline_date;
  const project_budget = req.body.project_budget;
  const description = req.body.description;
  const designer = req.body.designer;
  const user_id = req.body.user_id;
  const client_email = req.body.client_email;
  const org_id = req.body.org_id;

  if (!project_ID) {
    responseData(res, "", 400, false, " Project ID is required.", []);
  } else if (!timeline_date) {
    responseData(res, "", 400, false, " timeline_date is required.", []);
  } else if (!project_budget) {
    responseData(res, "", 400, false, " project_budget is required.", []);
  } else if (!project_status) {
    responseData(res, "", 400, false, "project status required.", []);
  }
  else if (!designer && onlyAlphabetsValidation(designer)) {
    responseData(res, "", 400, false, "designer name is required.", []);
  }
  else if (!user_id) {
    responseData(res, "", 400, false, "user id is required.", []);
  }
  else if (!onlyEmailValidation(client_email) && client_email.length > 5) {
    responseData(res, "", 400, false, "client email is invalid", []);
  }
  else if (!org_id) {
    return responseData(res, "", 400, false, "Organization Id is required");
  }

  //  *********** add other validation **********//
  else {
    try {
      const check_org = await orgModel.findOne({ _id: org_id })
      if (!check_org) {
        return responseData(res, "", 404, false, "Org not found");
      }
      const find_user = await registerModel.find
        ({ _id: user_id, organization: org_id })
      if (!find_user) {
        responseData(res, "", 400, false, "user not found.", []);

      }
      const project_find = await projectModel.find({ project_id: project_ID, org_id:org_id });
      if (project_find.length > 0) {

        const newDate = new Date();
        const project_update = await projectModel.findOneAndUpdate(
          { project_id: project_ID, org_id: org_id, 'client.client_email': project_find[0].client[0].client_email },
          {
            $set: {
              project_budget: project_budget,
              project_status: project_status,
              timeline_date: timeline_date,
              project_end_date: timeline_date,
              description: description,
              designer: designer,
              'client.$.client_email': client_email
            },

            $push: {
              project_updated_by: {
                username: find_user[0].username,
                role: find_user[0].role,
                project_budget: project_budget,
                project_status: project_status,
                timeline_date: timeline_date,
                description: description,
                designer: designer,
                message: `has updated project ${project_find[0].project_name}.`,
                updated_date: newDate

              }

            },

          },

          { new: true, useFindAndModify: false }
        );

        if(project_find[0].project_status != project_status) {
          const projectUpdate = {
            username: find_user[0].username,
            role: find_user[0].role,
            message: ` has updated project status from ${project_find[0].project_status} to ${project_status}.`,
            updated_date: newDate,
            tags: [],
            type: 'project updation'
  
          }

          await createOrUpdateTimeline('', project_ID, org_id, {}, projectUpdate, res);
        } else {
          const projectUpdate = {
            username: find_user[0].username,
            role: find_user[0].role,
            message: ` has updated project ${project_find[0].project_name}.`,
            updated_date: newDate,
            tags: [],
            type: 'project updation'
  
          }
          await createOrUpdateTimeline('', project_ID, org_id, {}, projectUpdate, res);

        }



        const newNotification = new notificationModel({
          type: "project",
          notification_id: generateSixDigitNumber(),
          itemId: project_ID,
          message: `project  updated: Project name ${project_find[0].project_name}up date on ${formatDate(new Date())}.`,
          status: false,
        });
        await newNotification.save();


        responseData(
          res,
          "Project Data Updated",
          200,
          true,
          "",
        );
      }
      if (project_find.length < 1) {
        responseData(res, "", 404, false, "Project Data Not Found", []);
      }
    } catch (err) {
      res.send(err);
      console.log(err);
    }
  }
};


export const projectActivity = async (req, res) => {
  try {
    const project_id = req.query.project_id;
    const org_id = req.query.org_id;
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 5; // Default to 5 items per page
    const skip = (page - 1) * limit;


    if (!project_id) {
      return responseData(res, "", false, 400, "ProjectId is required");
    }
    if (!org_id) {
      return responseData(res, "", false, 400, "OrgId is required");
    }

    // Fetch project activities and only the project_updated_by field
    const check_org = await orgModel.findOne({ _id: org_id })
    if (!check_org) {
      return responseData(res, "", 404, false, "Org not found");
    }
    const project = await projectModel
      .findOne({ project_id: project_id, org_id:org_id })
      .select('project_updated_by');

    if (!project) {
      return responseData(res, "", false, 404, "Project not found");
    }

    const activities = project.project_updated_by.reverse() || [];
    
    const totalActivities = activities.length;

    // Slice the activities array for pagination
    const paginatedActivities = activities.slice(skip, skip + limit);
    

    // Structure the response
    const response = {
      activities: paginatedActivities,
      total: totalActivities,
      page,
      limit,
      totalPages: Math.ceil(totalActivities / limit),
    }
    responseData(res, "Project Activity", 200, true, "", response);
  } catch (err) {
    console.error(err); // Log the error for debugging
    responseData(res, "", 400, false, "Error fetching project activity", err);
  }
};





