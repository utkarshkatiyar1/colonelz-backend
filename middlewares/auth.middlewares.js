
import jwt from "jsonwebtoken";
import { responseData } from "../utils/respounse.js";
import registerModel from "../models/usersModels/register.model.js";
import projectModel from "../models/adminModels/project.model.js";
import fileuploadModel from "../models/adminModels/fileuploadModel.js";
import { notificationForUser ,getNotification} from "../controllers/notification/notification.controller.js";
import cron from "node-cron";
import leadModel from "../models/adminModels/leadModel.js";


export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.auth ||
      req.header("Authorization")?.replace("Bearer", "").trim();
    
    ;
    if (!token) {
      return responseData(
        res,
        "",
        401,
        false,
        "Unauthorized: No token provided"
      );
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
 
    const user = await registerModel.findById(decodedToken?.id);



    if (!user) {
      return responseData(res, "", 401, false, "Unauthorized: User not found");
    }
    
req.user = user
if(user.status===false)
{
  return responseData(res, "", 401, false, "Unauthorized: User is not active");
}
    next(); // Proceed to the next 
  
  } catch (err) {
   
    return responseData(res, "", 401, false, "Unauthorized: Invalid token");
  }
};

export const checkAvailableUserIsAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.auth || req.header("Authorization")?.replace("Bearer", "").trim();
    if (!token) {
      return responseData(res, "", 401, false, "Unauthorized: No token provided");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await registerModel.findById(decodedToken?.id).lean();

    if (!user) {
      return responseData(res, "", 401, false, "Unauthorized: User not found");
    }

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

    // Collect user-related data
    const projectIds = user.data[0].projectData.map(item => item.project_id);
    const leadIds = user.data[0].leadData.map(item => item.lead_id);

    const projects = await projectModel.find({ project_id: { $in: projectIds } }).lean();
    const files = await fileuploadModel.find({ project_id: { $in: projectIds } }).lean();
    const leads = await leadModel.find({ lead_id: { $in: leadIds } }).lean();
    const leadFiles = await fileuploadModel.find({ lead_id: { $in: leadIds } }).lean();

    // Prepare project data
    const projectData = projects.map(project => {
      const projectFiles = files.find(file => file.project_id === project.project_id);
      return {
        project_name: project.project_name,
        project_id: project.project_id,
        client_name: project.client[0]?.client_name,
        project_type: project.project_type,
        project_status: project.project_status,
        files: projectFiles?.files || []
      };
    });

    // Prepare MOM data
    const MomData = projects.flatMap(project =>
      project.mom.map(mom => ({
        project_id: project.project_id,
        project_name: project.project_name,
        mom_id: mom.mom_id,
        client_name: project.client[0]?.client_name,
        location: mom.location,
        meetingDate: mom.meetingdate,
      }))
    );

    // Categorize projects by status
    const execution = projects.filter(project => project.project_status === "executing");
    const design = projects.filter(project => project.project_status === "designing");
    const completed = projects.filter(project => project.project_status === "completed");

    // Prepare lead data
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
      total_Project: projects.length,
      Execution_Phase: execution.length,
      Design_Phase: design.length,
      completed: completed.length,
      active_Project: projects.length - completed.length,
      projects,
      projectData,
      NotificationData: user.data[0].notificationData || [],
      MomData,
      leadData,
      leads,
    };

    return responseData(res, "User data found", 200, true, "", response);
  } catch (err) {
    console.error(err);
    return responseData(res, "", 401, false, "Unauthorized: Invalid token");
  }
};

export const isAdmin = async(req,res,next) =>{

  try {
    const token = req.cookies?.auth ||
      req.header("Authorization")?.replace("Bearer", "").trim();
    ;
    if (!token) {
      return responseData(
        res,
        "",
        401,
        false,
        "Unauthorized: No token provided"
      );
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);


    const user = await registerModel.findById(decodedToken?.id);


    if (!user) {
      return responseData(res, "", 401, false, "Unauthorized: User not found");
    }

    if (user.role === "ADMIN" || user.role === "Senior Architect" || user.role ==='ORGADMIN' || user.role === 'SUPERADMIN' )
  {
    next(); // Proceed to the next 
  }
  else{
    return responseData(res, "", 401, false, "Unauthorized: You are not  able to access");
  }
   
  } catch (err) {
   
    return responseData(res, "", 401, false, "Unauthorized: Invalid token");
  }
}


















