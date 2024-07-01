import { responseData } from "../../../utils/respounse.js";
import projectModel from "../../../models/adminModels/project.model.js";
import taskModel from "../../../models/adminModels/task.model.js";
import registerModel from "../../../models/usersModels/register.model.js";
import { onlyAlphabetsValidation } from "../../../utils/validation.js";


function generateSixDigitNumber() {
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomNumber;
}
export const createTask = async (req, res) => {

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

        if (!user_id) {
            responseData(res, "", 404, false, "User Id required", [])
        }
        else if (!project_id) {
            responseData(res, "", 404, false, "Project Id required", [])
        }
        else if (!onlyAlphabetsValidation(task_name) &&  task_name.length > 3) {
            responseData(res, "", 404, false, "Task Name should be alphabets", [])
        }
        else if (!task_priority) {
            responseData(res, "", 404, false, "task priority required", [])

        }
        else if (!task_start_date) {
            responseData(res, "", 404, false, "Task start date  required", [])
        }
        else if (!task_end_date) {
            responseData(res, "", 404, false, "Task end date required", [])
        }
        else if (!task_status) {
            responseData(res, "", 404, false, "Task status required", [])
        }
        else if (!task_assignee) {
            responseData(res, "", 404, false, "Task assignee required", [])
        }
        else if (!reporter) {
            responseData(res, "", 404, false, "Task reporter required", [])
        }
        else {
            const check_user = await registerModel.findById({ _id: user_id })
            if (!check_user) {
                responseData(res, "", 404, false, "User not found", [])
            }
            else {
                const check_project = await projectModel.findOne({ project_id: project_id })
                if (!check_project) {
                    responseData(res, "", 404, false, "Project not found", [])
                }
                else {
                    const task = new taskModel({
                        project_id: project_id,
                        task_id: `TK-${generateSixDigitNumber()}`,
                        task_name: task_name,
                        task_description: task_description,
                        task_start_date: task_start_date,
                        task_end_date: task_end_date,
                        task_status: task_status,
                        task_priority: task_priority,
                        task_assignee: task_assignee,
                        task_createdBy: check_user.username,
                        task_createdOn: new Date(),
                        reporter: reporter,
                        subtasks: []

                    })

                    await task.save();
                    responseData(res, "Task created successfully", 200, true, "", [])
                }
            }

        }

    }
    catch (err) {
        console.log(err);
        res.send(err);
    }

}
export const getAllTasks = async (req, res) => {

    try {
        const user_id = req.query.user_id;
        const project_id = req.query.project_id;
        if (!user_id) {
            responseData(res, "", 404, false, "User Id required", [])
        }
        else if (!project_id) {
            responseData(res, "", 404, false, "Project Id required", [])
        }
       
      else{
            const check_user = await registerModel.findById({ _id: user_id })
            if (!check_user) {
                responseData(res, "", 404, false, "User not found", [])
            }
            else {
                const check_project = await projectModel.findOne({ project_id: project_id })
                if (!check_project) {
                    responseData(res, "", 404, false, "Project not found", [])
                }
                else {
                    const tasks = await taskModel.find({ project_id: project_id })
                    if (tasks.length < 1) {
                        responseData(res, "", 404, false, "Tasks not found", [])

                    }
                    if (tasks.length > 0) {
                        let response = []
                        for (let i = 0; i < tasks.length; i++) {
                            response.push({
                                project_id: tasks[i].project_id,
                                task_id: tasks[i].task_id,
                                task_name: tasks[i].task_name,
                                task_description: tasks[i].task_description,
                                task_start_date: tasks[i].task_start_date,
                                task_end_date: tasks[i].task_end_date,
                                task_status: tasks[i].task_status,
                                task_priority: tasks[i].task_priority,
                                task_createdOn: tasks[i].task_createdOn,
                                reporter: tasks[i].reporter,
                                assignee: tasks[i].assignee,
                                task_createdBy: tasks[i].task_createdBy,
                                number_of_subtasks: tasks[i].subtasks.length

                            })
                        }

                        responseData(res, "Tasks found successfully", 200, true, "", response)
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


export const getSingleTask = async (req, res) => {

    try {
        const user_id = req.query.user_id;
        const project_id = req.query.project_id;
        const task_id = req.query.task_id;

        const check_user = await registerModel.findById({ _id: user_id })
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
                    responseData(res, "Task found successfully", 200, true, "", check_task)
                }
            }
        }







    }
    catch (err) {
        res.send(err);
        console.log(err);
    }
}


export const updateTask = async (req, res) => {

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
        const task_id = req.body.task_id;
        if (!user_id) {
            responseData(res, "", 404, false, "User Id required", [])
        }
        else if (!project_id) {
            responseData(res, "", 404, false, "Project Id required", [])
        }
        else if (!onlyAlphabetsValidation(task_name) && task_name.length > 3) {
            responseData(res, "", 404, false, "Task Name should be alphabets", [])
        }
        else if(!task_id)
            {
            responseData(res, "", 404, false, "Task Id required", [])
            }
        else if (!task_priority) {
            responseData(res, "", 404, false, "task priority required", [])

        }
        else if (!task_start_date) {
            responseData(res, "", 404, false, "Task start date  required", [])
        }
        else if (!task_end_date) {
            responseData(res, "", 404, false, "Task end date required", [])
        }
        else if (!task_status) {
            responseData(res, "", 404, false, "Task status required", [])
        }
        else if (!task_assignee) {
            responseData(res, "", 404, false, "Task assignee required", [])
        }
        else if (!reporter) {
            responseData(res, "", 404, false, "Task reporter required", [])
        }
        else{
            const check_user = await registerModel.findById({ _id: user_id })
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
                        const update_task = await taskModel.findOneAndUpdate({ task_id: task_id },
                            {
                                $set: {
                                    task_name: task_name,
                                    task_description: task_description,
                                    task_start_date: task_start_date,
                                    task_end_date: task_end_date,
                                    task_status: task_status,
                                    task_priority: task_priority,
                                    task_assignee: task_assignee,
                                    reporter: reporter,
                                },
                                $push: {
                                    task_updatedBy: {
                                        task_updatedBy: check_user.username,
                                        task_updatedOn: new Date()
                                    }

                                }
                            },
                            { new: true, useFindAndModify: false }
                        )
                        if (update_task) {
                            responseData(res, "Task updated successfully", 200, true, "", [])
                        }
                        else {
                            responseData(res, "", 404, false, "Task not updated", [])
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

export const deleteTask = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const project_id = req.body.project_id;
        const task_id = req.body.task_id;

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
            const check_user = await registerModel.findOne({ user_id: user_id });
            if (!check_user) {
                responseData(res, "", 404, false, "User not found", [])
            }
            else {
                const check_project = await projectModel.findOne({ project_id: project_id });
                if (!check_project) {
                    responseData(res, "", 404, false, "Project not found", [])
                }
                else {
                    const check_task = await taskModel.findOne({ task_id: task_id });
                    if (!check_task) {
                        responseData(res, "", 404, false, "Task not found", [])
                    }
                    else {
                        const delete_task = await taskModel.findOneAndDelete({ task_id: task_id })
                        if (delete_task) {
                            responseData(res, "Task deleted successfully", 200, true, "", [])
                        }
                        else {
                            responseData(res, "", 404, false, "Task not deleted", [])
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

