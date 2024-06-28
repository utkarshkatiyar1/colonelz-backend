import { responseData } from "../../../utils/respounse.js";
import registerModel from "../../../models/usersModels/register.model.js";
import projectModel from "../../../models/adminModels/project.model.js";
import taskModel from "../../../models/adminModels/task.model.js";
import { onlyAlphabetsValidation } from "../../../utils/validation.js";


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
        const sub_task_reporter = req.body.sub_task_reporter;

        if (!user_id) {
            responseData(res, "", 404, false, "User Id required", [])
        }
        else if (!project_id) {
            responseData(res, "", 404, false, "Project Id required", [])
        }
        else if(!task_id)
            {
            responseData(res, "", 404, false, "Task Id required", [])
            }
        else if (!onlyAlphabetsValidation(sub_task_name) && sub_task_name.length > 3) {
            responseData(res, "", 404, false, "Sub task Name should be alphabets", [])
        }
        else if (!sub_task_priority) {
            responseData(res, "", 404, false, "Sub task priority required", [])

        }
        else if (!sub_task_start_date) {
            responseData(res, "", 404, false, "Sub task start date  required", [])
        }
        else if (!sub_task_end_date) {
            responseData(res, "", 404, false, " Sub task end date required", [])
        }
        else if (!sub_task_status) {
            responseData(res, "", 404, false, "  Sub task status required", [])
        }
        else if (!sub_task_assignee) {
            responseData(res, "", 404, false, "  Sub task assignee required", [])
        }
        else if (!sub_task_reporter) {
            responseData(res, "", 404, false, " Sub task reporter required", [])
        }
        else
        {
            const check_user = await registerModel.findOne({ _id: user_id })
            if (!check_user) {
                responseData(res, "", 404, false, "User not found", [])

            }
            else {
                const check_project = await projectModel.findOne({ project_id: project_id })
                if (!check_project) {

                    responseData(res, "", 404, false, "Project not found", [])
                }
                else {
                    const check_task = await taskModel.findOne({ task_id: task_id })
                    if (!check_task) {
                        responseData(res, "", 404, false, "Task not found", [])
                    }

                    if (check_task) {
                        const update_task = await taskModel.findOneAndUpdate({ task_id: task_id },
                            {
                                $push: {
                                    subtasks: {
                                        sub_task_id: `STK-${generateSixDigitNumber()}`,
                                        sub_task_name: sub_task_name,
                                        sub_task_description: sub_task_description,
                                        sub_task_start_date: sub_task_start_date,
                                        sub_task_end_date: sub_task_end_date,
                                        sub_task_status: sub_task_status,
                                        sub_task_priority: sub_task_priority,
                                        sub_task_assignee: sub_task_assignee,
                                        sub_task_createdBy: check_user.username,
                                        sub_task_createdOn: new Date(),
                                        sub_task_reporter: sub_task_reporter

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
        if (!user_id) {
            responseData(res, "", 404, false, "User Id required", [])
        }
        else if (!project_id) {
            responseData(res, "", 404, false, "Project Id required", [])
        }
       
        else if (!task_id) {
            responseData(res, "", 404, false, "Task Id required", [])
        }
        else{

            const check_user = await registerModel.findOne({ _id: user_id })
            if (!check_user) {
                responseData(res, "", 404, false, "User not found", [])
            }
            else {
                const check_project = await projectModel.findOne({ project_id: project_id })
                if (!check_project) {
                    responseData(res, "", 404, false, "Project not found", [])
                }
                else {
                    const check_task = await taskModel.findOne({ task_id: task_id })
                    if (!check_task) {
                        responseData(res, "", 404, false, "Task not found", [])
                    }
                    else {
                        let response = []
                        for (let i = 0; i < check_task.subtasks.length; i++) {
                            response.push({
                                sub_task_id: check_task.subtasks[i].sub_task_id,
                                sub_task_name: check_task.subtasks[i].sub_task_name,
                                sub_task_description: check_task.subtasks[i].sub_task_description,
                                sub_task_start_date: check_task.subtasks[i].sub_task_start_date,
                                sub_task_end_date: check_task.subtasks[i].sub_task_end_date,
                                sub_task_status: check_task.subtasks[i].sub_task_status,
                                sub_task_priority: check_task.subtasks[i].sub_task_priority,
                                sub_task_assignee: check_task.subtasks[i].sub_task_assignee,
                                sub_task_createdBy: check_task.subtasks[i].sub_task_createdBy,
                                sub_task_createdOn: check_task.subtasks[i].sub_task_createdOn,
                                sub_task_reporter: check_task.subtasks[i].sub_task_reporter

                            })
                        }
                        responseData(res, "All sub task fetch successfully", 200, false, "", response)
                    }
                }
            }

        }
    }
    catch (err) {
        console.log(err);
        res.send(err);
    }
}

export const getSingleSubTask = async (req, res) => {
    try {
        const user_id = req.query.user_id;
        const project_id = req.query.project_id;
        const task_id = req.query.task_id;
        const sub_task_id = req.query.sub_task_id;
        if (!user_id) {
            responseData(res, "", 404, false, "User Id required", [])
        }
        else if (!project_id) {
            responseData(res, "", 404, false, "Project Id required", [])
        }
       
        else if (!task_id) {
            responseData(res, "", 404, false, "Task Id required", [])
        }
        else if (!sub_task_id) {
            responseData(res, "", 404, false, "Sub-task Id required", [])
        }
        else{
            const check_user = await registerModel.findOne({ _id: user_id })
            if (!check_user) {
                responseData(res, "", 404, false, "User not found", [])
            }
            else {
                const check_project = await projectModel.findOne({ project_id: project_id })
                if (!check_project) {
                    responseData(res, "", 404, false, "Project not found", [])
                }
                else {
                    const check_task = await taskModel.findOne({ task_id: task_id })
                    if (!check_task) {
                        responseData(res, "", 404, false, "Task not found", [])
                    }
                    else {
                        const sub_task = check_task.subtasks.find(item => item.sub_task_id == sub_task_id);

                        if (!sub_task) {
                            return responseData(res, "", 404, false, "Sub-task not found", []);
                        }
                        else {
                            return responseData(res, "Sub-task fetched successfully", 200, true, "", sub_task);
                        }

                    }
                }
            }
        }

    }
    catch (err) {
        console.log(err);
        res.send(err);
    }
}


export const updateSubTask = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const project_id = req.body.project_id;
        const task_id = req.body.task_id;
        const sub_task_id = req.body.sub_task_id;
        const sub_task_name = req.body.sub_task_name;
        const sub_task_description = req.body.sub_task_description;
        const sub_task_start_date = req.body.sub_task_start_date;
        const sub_task_end_date = req.body.sub_task_end_date;
        const sub_task_status = req.body.sub_task_status;
        const sub_task_priority = req.body.sub_task_priority;
        const sub_task_assignee = req.body.sub_task_assignee;
        const sub_task_reporter = req.body.sub_task_reporter;

        if (!user_id) {
            responseData(res, "", 404, false, "User Id required", [])
        }
        else if (!project_id) {
            responseData(res, "", 404, false, "Project Id required", [])
        }
        else if (!task_id) {
            responseData(res, "", 404, false, "Task Id required", [])
        }
        else if (!sub_task_id) {
            responseData(res, "", 404, false, "Sub-task Id required", [])
        }
        else if (!onlyAlphabetsValidation(sub_task_name) && sub_task_name.length > 3) {
            responseData(res, "", 404, false, "Sub task Name should be alphabets", [])
        }
        else if (!sub_task_priority) {
            responseData(res, "", 404, false, "Sub task priority required", [])

        }
        else if (!sub_task_start_date) {
            responseData(res, "", 404, false, "Sub task start date  required", [])
        }
        else if (!sub_task_end_date) {
            responseData(res, "", 404, false, " Sub task end date required", [])
        }
        else if (!sub_task_status) {
            responseData(res, "", 404, false, "  Sub task status required", [])
        }
        else if (!sub_task_assignee) {
            responseData(res, "", 404, false, "  Sub task assignee required", [])
        }
        else if (!sub_task_reporter) {
            responseData(res, "", 404, false, " Sub task reporter required", [])
        }

        else{
            const check_user = await registerModel.findOne({ _id: user_id })
            if (!check_user) {
                responseData(res, "", 404, false, "User not found", [])
            }
            else {
                const check_project = await projectModel.findOne({ project_id: project_id })
                if (!check_project) {
                    responseData(res, "", 404, false, "Project not found", [])
                }
                else {
                    const check_task = await taskModel.findOne({ task_id: task_id })
                    if (!check_task) {
                        responseData(res, "", 404, false, "Task not found", [])
                    }
                    else {
                        const update_subtask = await taskModel.findOneAndUpdate({
                            task_id: task_id,
                            "subtasks.sub_task_id": sub_task_id
                        },
                            {
                                $set: {
                                    "subtasks.$.sub_task_name": sub_task_name,
                                    "subtasks.$.sub_task_description": sub_task_description,
                                    "subtasks.$.sub_task_start_date": sub_task_start_date,
                                    "subtasks.$.sub_task_end_date": sub_task_end_date,
                                    "subtasks.$.sub_task_status": sub_task_status,
                                    "subtasks.$.sub_task_priority": sub_task_priority,
                                    "subtasks.$.sub_task_assignee": sub_task_assignee,
                                    "subtasks.$.sub_task_reporter": sub_task_reporter
                                },
                                $push: {
                                    "subtasks.$.sub_task_updatedBy": {
                                        sub_task_updatedBy: check_user.username,
                                        sub_task_updatedOn: new Date()
                                    }
                                }
                            },
                            { new: true, useFindAndModify: false }
                        )
                        if (update_subtask) {
                            responseData(res, "Sub Task Updated Successfully", 200, true, "", [])
                        }
                        else {
                            responseData(res, "", 404, false, "Sub Task Not Updated", [])
                        }


                    }

                }
            }

        }

        
    }
    catch (err) {
        console.log(err);
        res.send(err);
    }
}


export const deleteSubTask = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const project_id = req.body.project_id;
        const task_id = req.body.task_id;
        const sub_task_id = req.body.sub_task_id;
        if (!user_id) {
            responseData(res, "", 404, false, "User Id required", [])
        }
        else if (!project_id) {
            responseData(res, "", 404, false, "Project Id required", [])
        }
      
        else if (!task_id) {
            responseData(res, "", 404, false, "Task Id required", [])
        }
        else if (!sub_task_id) {
            responseData(res, "", 404, false, "Sub-task Id required", [])
        }
        else
        {
            const check_user = await registerModel.findOne({ _id: user_id })
            if (!check_user) {
                responseData(res, "", 404, false, "User not found", [])
            }
            else {
                const check_project = await projectModel.findOne({ project_id: project_id })
                if (!check_project) {
                    responseData(res, "", 404, false, "Project not found", [])
                }
                else {
                    const check_task = await taskModel.findOne({ task_id: task_id })
                    if (!check_task) {
                        responseData(res, "", 404, false, "Task not found", [])
                    }
                    else {
                        const delete_subtask = await taskModel.findOneAndUpdate({
                            task_id: task_id,
                            "subtasks.sub_task_id": sub_task_id
                        },
                            {
                                $pull: { "subtasks": { "sub_task_id": sub_task_id } }
                            },
                            { new: true }
                        )
                        if (delete_subtask) {
                            responseData(res, "Sub Task Deleted Successfully", 200, true, "", [])
                        }
                        else {
                            responseData(res, "", 404, false, "Sub Task Not Deleted", [])
                        }
                    }
                }
            }
        }

       
    }
    catch (err) {
        console.log(err);
        res.send(err);
    }
}