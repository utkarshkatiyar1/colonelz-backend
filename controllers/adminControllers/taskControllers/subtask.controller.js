import { responseData } from "../../../utils/respounse.js";
import registerModel from "../../../models/usersModels/register.model.js";
import projectModel from "../../../models/adminModels/project.model.js";
import taskModel from "../../../models/adminModels/task.model.js";


function generateSixDigitNumber() {
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomNumber;
}

export const createSubTask = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const project_id = req.body.project_id;
        const task_id = req.body.task_id;
        const sub_task_name = req.body.sub_task_name;
        const sub_task_description = req.body.sub_task_description;
        const sub_task_start_date = req.body.sub_task_start_date;
        const sub_task_end_date = req.body.sub_task_end_date;
        const sub_task_status = req.body.sub_task_status;
        const sub_task_priority = req.body.sub_task_priority;
        const sub_task_assignee = req.body.sub_task_assignee;
        const sub_reporter = req.body.sub_reporter;

        const check_user = await registerModel.findOne({ _id: user_id })
        if (!check_user) {
            responseData(res, "", 404, false, "User not found", [])

        }
        const check_project = await projectModel.findOne({ project_id: project_id })
        if (!check_project) {

            responseData(res, "", 404, false, "Project not found", [])
        }
        const check_task = await taskModel.findOne({ task_id: task_id })
        if (!check_task) {
            responseData(res, "", 404, false, "Task not found", [])
        }

        if (check_task) {
            const update_task = await taskModel.findOneAndUpdate({ task_id: task_id },
                {
                    $push: {
                        subtasks: {
                            sub_task_id:`STK-${generateSixDigitNumber()}`,
                            sub_task_name: sub_task_name,
                            sub_task_description: sub_task_description,
                            sub_task_start_date: sub_task_start_date,
                            sub_task_end_date: sub_task_end_date,
                            sub_task_status: sub_task_status,
                            sub_task_priority: sub_task_priority,
                            sub_task_assignee: sub_task_assignee,
                            sub_task_createdBy: check_user.username,
                            sub_task_createdOn: new Date(),
                            sub_reporter: sub_reporter

                        }

                    }
                },
                { new: true, useFindAndModify: false }
            )
            if (update_task) {
                responseData(res, "Sub Task added successfully", 200, true, "", [])
            }
            else {
                responseData(res, "", 404, false, "Sub Task not added", [])
            }

        }
    }
    catch (err) {
        console.log(err)
        res.send(err)
    }
}

export const getAllSubTask = async (req, res) => {

    try {
        const user_id = req.query.user_id;
        const project_id = req.query.project_id;
        const task_id = req.query.task_id;

        const check_user = await registerModel.findOne({ _id: user_id })
        if (!check_user) {
            responseData(res, "", 404, false, "User not found", [])
        }
        const check_project = await projectModel.findOne({ project_id: project_id })
        if (!check_project) {
            responseData(res, "", 404, false, "Project not found", [])
        }
        const check_task = await taskModel.findOne({ task_id: task_id })
        if (!check_task) {
            responseData(res, "", 404, false, "Task not found", [])
        }
        responseData(res,"All sub task fetch successfully", 200, false, "", check_task.subtasks)

    }
    catch (err) {
        console.log(err);
        res.send(err);
    }
}

export const getSingleSubTask = async(req,res) =>{
    try {
        const user_id = req.query.user_id;
        const project_id = req.query.project_id;
        const task_id = req.query.task_id;
        const sub_task_id = req.query.sub_task_id;
        

        const check_user = await registerModel.findOne({ _id: user_id })
        if (!check_user) {
            responseData(res, "", 404, false, "User not found", [])
        }
        const check_project = await projectModel.findOne({ project_id: project_id })
        if (!check_project) {
            responseData(res, "", 404, false, "Project not found", [])
        }
        const check_task = await taskModel.findOne({ task_id: task_id })
        if (!check_task) {
            responseData(res, "", 404, false, "Task not found", [])
        }
        const sub_task = check_task.subtasks.find(item => item.sub_task_id == sub_task_id);
      
        if (!sub_task) {
            return responseData(res, "", 404, false, "Sub-task not found", []);
        }

      
        return responseData(res, "Sub-task fetched successfully", 200, true, "", sub_task);

    }
    catch (err) {
        console.log(err);
        res.send(err);
    }
}