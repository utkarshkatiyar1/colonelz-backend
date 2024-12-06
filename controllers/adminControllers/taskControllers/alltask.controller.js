import { responseData } from "../../../utils/respounse.js";
import projectModel from "../../../models/adminModels/project.model.js";
import taskModel from "../../../models/adminModels/task.model.js";
import leadTaskModel from "../../../models/adminModels/leadTask.model.js";
import leadModel from "../../../models/adminModels/leadModel.js";
import { filterTasks } from "../../../utils/filterTasks.js"; 
export const Alltask = async (req, res) => {
    try {
        const { org_id, task_assignee, task_status, task_priority } = req.query;

        if (!org_id) {
            return responseData(res, "", 400, false, "org_id is required", []);
        }
        const [projectTasks, leadTasks] = await Promise.all([
            taskModel.find({ org_id }),    
            leadTaskModel.find({ org_id }) 
        ]);
        const [projects, leads] = await Promise.all([
            projectModel.find({ org_id, project_id: { $in: projectTasks.map(task => task.project_id) } }),
            leadModel.find({ org_id, lead_id: { $in: leadTasks.map(task => task.lead_id) } })
        ]);
        const projectTaskDetails = projectTasks.map(task => {
            const project = projects.find(p => p.project_id === task.project_id);
            return {
                project_id: task.project_id,
                project_name: project ? project.project_name : "Unknown",
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
        const leadTaskDetails = leadTasks.map(task => {
            const lead = leads.find(l => l.lead_id === task.lead_id);
            return {
                lead_id: task.lead_id,
                lead_name: lead ? lead.name : "Unknown",
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

        
        const allTasks = [...projectTaskDetails, ...leadTaskDetails];
        const filterConditions = {};
        if (task_assignee) filterConditions.task_assignee = task_assignee;
        if (task_status) filterConditions.task_status = task_status;
        if (task_priority) filterConditions.task_priority = task_priority;
        const filteredTasks = filterTasks(allTasks, filterConditions);
        return responseData(res, "All tasks fetched successfully", 200, true, "", filteredTasks);

    } catch (error) {
        console.log(error);
        return responseData(res, "", 500, false, "Internal server error", []);
    }
};


