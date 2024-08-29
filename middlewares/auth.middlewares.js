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
      
      NotificationData: user.data[0].notificationData || [],
     
    };

    return responseData(res, "User data found", 200, true, "", response);
  } catch (err) {
    console.error("Error in checkAvailableUserIsAdmin:", err);
    return responseData(res, "", 401, false, "Unauthorized: Invalid token");
  }
};
export const checkAvailableUserIsAdminInFile = async (req, res, next) => {
  try {
    const user = req.user; // Access user from req object

    if (['ADMIN', 'Senior Architect', 'ORGADMIN', 'SUPERADMIN'].includes(user.role)) {
      return next();
    }

    // Schedule a cron job to send a notification at midnight
 

    // Collect user-related data
    const projectIds = user.data[0].projectData.map(item => item.project_id);
    const leadIds = user.data[0].leadData.map(item => item.lead_id);

    const [projects, files, leads, leadFiles] = await Promise.all([
      projectModel.find({ project_id: { $in: projectIds } }).lean(),
      fileuploadModel.find({ project_id: { $in: projectIds } }).lean(),
      leadModel.find({ lead_id: { $in: leadIds } }).lean(),
      fileuploadModel.find({ lead_id: { $in: leadIds } }).lean()
    ]);

    // Prepare project data and MomData in a single pass


    projects.forEach(project => {
      const projectFiles = files.find(file => file.project_id === project.project_id);
      const projectItem = {
        project_name: project.project_name,
        project_id: project.project_id,
        client_name: project.client[0]?.client_name,
        project_type: project.project_type,
        project_status: project.project_status,
        files: projectFiles?.files || []
      };
      projectData.push(projectItem);

    });

    // Prepare lead data in a single pass
    const leadData = leads.map(lead => {
      const leadFile = leadFiles.find(file => file.lead_id === lead.lead_id);
      return {
        lead_id: lead.lead_id,
        lead_Name: lead.name,
        lead_email: lead.email,
        lead_phone: lead.phone,
        lead_status: lead.status,
        lead_date: lead.date,
        files: leadFile?.files || []
      };
    });

    // Prepare response data
    const response = {
      projectData,
      leadData,
    
    };

    return responseData(res, "User data found", 200, true, "", response);
  } catch (err) {
    console.error("Error in checkAvailableUserIsAdmin:", err);
    return responseData(res, "", 401, false, "Unauthorized: Invalid token");
  }
};


export const checkAvailableUserIsAdminInLead = async (req, res, next) => {
  try {
    const user = req.user; // Access user from req object
    

    if (['ADMIN', 'Senior Architect', 'ORGADMIN', 'SUPERADMIN'].includes(user.role)) {
      return next();
    }

 

    // Collect user-related data
    
    const leadIds = user.data[0].leadData.map(item => item.lead_id);

    const [ leads] = await Promise.all([
      leadModel.find({ lead_id: { $in: leadIds } }).lean(),
 
    ]);

    const response = {
      leads
    };

    return responseData(res, "User data found", 200, true, "", response);
  } catch (err) {
    console.error("Error in checkAvailableUserIsAdmin:", err);
    return responseData(res, "", 401, false, "Unauthorized: Invalid token");
  }
};


export const checkAvailableUserIsAdmininProject = async(req, res, next) =>{
  try{
    const user = req.user;
    if (['ADMIN', 'Senior Architect', 'ORGADMIN', 'SUPERADMIN'].includes(user.role)) {
      return next();
    }
    const projectIds = user.data[0].projectData.map(item => item.project_id);
    const [projects] = await Promise.all([
      projectModel.find({ project_id: { $in: projectIds } }).lean(),
    ]);

    const execution = [];
    const design = [];
    const completed = [];

    projects.forEach(project => {
      
      const projectItem = {
        project_name: project.project_name,
        project_id: project.project_id,
        client_name: project.client[0]?.client_name,
        project_type: project.project_type,
        project_status: project.project_status,
      
      };
      


      // Categorize projects by status
      if (project.project_status === "executing") {
        execution.push(projectItem);
      } else if (project.project_status === "designing") {
        design.push(projectItem);
      } else if (project.project_status === "completed") {
        completed.push(projectItem);
      }
    });

    const response = {
      total_Project: projects.length,
      Execution_Phase: execution.length,
      Design_Phase: design.length,
      completed: completed.length,
      active_Project: projects.length - completed.length,
      projects,
   
   
    
    };
    return responseData(res, "User data found", 200, true, "", response);
  }
  catch(err)
  {
    console.error("Error in checkAvailableUserIsAdmin:", err);
    responseData(res, "", 500, false, "Internal Server Error")
  }

}

export const checkAvailableUserIsAdminInMom = async (req, res, next) => {
  try {
    const user = req.user;
    if (['ADMIN', 'Senior Architect', 'ORGADMIN', 'SUPERADMIN'].includes(user.role)) {
      return next();
    }
    const projectIds = user.data[0].projectData.map(item => item.project_id);
    const [projects] = await Promise.all([
      projectModel.find({ project_id: { $in: projectIds } }).lean(),
    ]);

    const MomData = [];


    projects.forEach(project => {
      const projectFiles = files.find(file => file.project_id === project.project_id);
      

      project.mom.forEach(mom => {
        MomData.push({
          project_id: project.project_id,
          project_name: project.project_name,
          mom_id: mom.mom_id,
          client_name: project.client[0]?.client_name,
          location: mom.location,
          meetingDate: mom.meetingdate,
        });
      });
    });

    const response = {
      MomData,

    };
    return responseData(res, "User data found", 200, true, "", response);
  }
  catch (err) {
    console.error("Error in checkAvailableUserIsAdmin:", err);
    responseData(res, "", 500, false, "Internal Server Error")
  }

}
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
