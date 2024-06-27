import { responseData } from "../../../utils/respounse.js";
import registerModel from "../../../models/usersModels/register.model.js";


export const createSubTask = async(req,res)=>{
    try {
        const user_id = req.body.user_id;
        const project_id = req.body.project_id;
        const task_name = req.body.task_name;
        const task_description = req.body.task_description;
        const task_start_date = req.body.task_start_date;
        const task_end_date = req.body.task_end_date;
        const task_status = req.body.task_status;
        const task_priority = req.body.task_priority;
        const task_assignee = req.body.task_assignee;
        const reporter = req.body.reporter;

    }
    catch(err)
    {
        console.log(err)
        res.send(err)
    }
}