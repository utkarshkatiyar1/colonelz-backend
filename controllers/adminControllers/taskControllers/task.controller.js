import { responseData } from "../../../utils/respounse.js";
import projectModel from "../../../models/adminModels/project.model.js";
import taskModel from "../../../models/adminModels/task.model.js";
import registerModel from "../../../models/usersModels/register.model.js";
import { onlyAlphabetsValidation } from "../../../utils/validation.js";
import { assign } from "nodemailer/lib/shared/index.js";
import timerModel from "../../../models/adminModels/timer.Model.js";


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
        const actual_task_start_date = req.body.actual_task_start_date;
        const estimated_task_start_date = req.body.estimated_task_start_date;
        const estimated_task_end_date = req.body.estimated_task_end_date;
        const actual_task_end_date = req.body.actual_task_end_date;
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
        else if (!onlyAlphabetsValidation(task_name) && task_name.length > 3) {
            responseData(res, "", 404, false, "Task Name should be alphabets", [])
        }
        else if (!task_priority) {
            responseData(res, "", 404, false, "task priority required", [])

        }
        else if (!actual_task_start_date && !estimated_task_start_date) {
            responseData(res, "", 404, false, "Task start date  required", [])
        }
        else if (!actual_task_end_date && !estimated_task_end_date) {
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
                    const check_assignee = await registerModel.findOne({ username: task_assignee,
                        
                     })
                    if (!check_assignee) {
                        responseData(res, "", 404, false, "Task assignee is  not registered user", [])
                    }
                    else
                    {
                        const check_reporter = await registerModel.findOne({ username: reporter })
                        if (!check_reporter) {
                            responseData(res, "", 404, false, "Task reporter is  not registered user", [])
                        }
                        else
                        {
                            if ((check_assignee.role === 'Senior Architect' || check_assignee.role === 'ADMIN') && (check_reporter.role ==='Senior Architect' ||  check_reporter.role ==='ADMIN') )
                            {
                                const task_id = `TK-${generateSixDigitNumber()}`

                                const task = new taskModel({
                                    project_id: project_id,
                                    task_id: task_id,
                                    task_name: task_name,
                                    task_description: task_description,
                                    actual_task_start_date: actual_task_start_date,
                                    actual_task_end_date: actual_task_end_date,
                                    estimated_task_end_date: estimated_task_end_date,
                                    estimated_task_start_date: estimated_task_start_date,
                                    task_status: task_status,
                                    task_priority: task_priority,
                                    task_assignee: task_assignee,
                                    task_createdBy: check_user.username,
                                    task_createdOn: new Date(),
                                    reporter: reporter,
                                    subtasks: []

                                })
                                const taskTime = new timerModel({
                                    project_id: project_id,
                                    task_id: task_id,
                                    task_name: task_name,
                                    task_assignee: task_assignee,
                                    task_time: '',
                                    subtaskstime: []
                                })

                                await task.save();
                                await taskTime.save();
                                await projectModel.findOneAndUpdate({ project_id: project_id },
                                    {
                                        $push: {
                                            project_updated_by: {
                                                username: check_user.username,
                                                role: check_user.role,
                                                message: `has created new task ${task_name}.`,
                                                updated_date: new Date()
                                            }
                                        }
                                    }
                                )
                                responseData(res, "Task created successfully", 200, true, "", [])

                            }
                            else{

                                const existProject = check_assignee.data[0].projectData.find((item) => item.project_id === project_id)
                                if (!existProject) {

                                    responseData(res, "", 404, false, "Task assignee is not part of this project", [])
                                }
                                else {
                                    const task_id = `TK-${generateSixDigitNumber()}`

                                    const task = new taskModel({
                                        project_id: project_id,
                                        task_id: task_id,
                                        task_name: task_name,
                                        task_description: task_description,
                                        actual_task_start_date: actual_task_start_date,
                                        actual_task_end_date: actual_task_end_date,
                                        estimated_task_end_date: estimated_task_end_date,
                                        estimated_task_start_date: estimated_task_start_date,
                                        task_status: task_status,
                                        task_priority: task_priority,
                                        task_assignee: task_assignee,
                                        task_createdBy: check_user.username,
                                        task_createdOn: new Date(),
                                        reporter: reporter,
                                        subtasks: []

                                    })
                                    const taskTime = new timerModel({
                                        project_id: project_id,
                                        task_id: task_id,
                                        task_name: task_name,
                                        task_assignee: task_assignee,
                                        task_time: '',
                                        subtaskstime: []
                                    })

                                    await task.save();
                                    await taskTime.save();
                                    await projectModel.findOneAndUpdate({ project_id: project_id },
                                        {
                                            $push: {
                                                project_updated_by: {
                                                    username: check_user.username,
                                                    role: check_user.role,
                                                    message: `has created new task ${task_name}.`,
                                                    updated_date: new Date()
                                                }
                                            }
                                        }
                                    )
                                    responseData(res, "Task created successfully", 200, true, "", [])
                                }


                            }
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
                    const tasks = await taskModel.find({ project_id: project_id })
                    if (tasks.length < 1) {
                        responseData(res, "Tasks not found", 200, false, "", [])

                    }
                    if (tasks.length > 0) {
                        let response = []
                        

                        
                        for (let i = 0; i < tasks.length; i++) {
                            let count = 0;
                            let percentage;
                            let total_length = tasks[i].subtasks.length;
                            for (let j = 0; j < tasks[i].subtasks.length; j++) {

                                if (tasks[i].subtasks[j].sub_task_status === 'Completed') {
                                    count++;
                                }
                                if (tasks[i].subtasks[j].sub_task_status === 'Cancelled') {
                                    total_length--;
                                }
                            }
                            percentage = (count / total_length) * 100;

                            response.push({
                                project_id: tasks[i].project_id,
                                task_id: tasks[i].task_id,
                                task_name: tasks[i].task_name,
                                task_description: tasks[i].task_description,
                                actual_task_start_date: tasks[i].actual_task_start_date,
                                actual_task_end_date: tasks[i].actual_task_end_date,
                                estimated_task_end_date: tasks[i].estimated_task_end_date,
                                estimated_task_start_date: tasks[i].estimated_task_start_date,
                                task_status: tasks[i].task_status,
                                task_priority: tasks[i].task_priority,
                                task_createdOn: tasks[i].task_createdOn,
                                reporter: tasks[i].reporter,
                                task_assignee: tasks[i].task_assignee,
                                task_createdBy: tasks[i].task_createdBy,
                                number_of_subtasks: tasks[i].subtasks.length,
                                percentage: percentage,


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
                const check_task = await taskModel.findOne({ task_id: task_id, project_id: project_id })
                if (!check_task) {
                    responseData(res, "Task not found", 200, false, "", [])
                }
                else {
                    let response = []
                    let percentage;

                    let count = 0;
                    let total_length = check_task.subtasks.length;
                    for (let j = 0; j < check_task.subtasks.length; j++) {

                        if (check_task.subtasks[j].sub_task_status === 'Completed') {
                            count++;
                        }
                        if (check_task.subtasks[j].sub_task_status === 'Cancelled') {
                            total_length--;
                        }
                    }
                    percentage = (count / total_length) * 100;

                    response.push({
                        project_id: check_task.project_id,
                        task_id: check_task.task_id,
                        task_name: check_task.task_name,
                        task_description: check_task.task_description,
                        actual_task_start_date: check_task.actual_task_start_date,
                        actual_task_end_date: check_task.actual_task_end_date,
                        estimated_task_end_date: check_task.estimated_task_end_date,
                        estimated_task_start_date: check_task.estimated_task_start_date,
                        task_status: check_task.task_status,
                        task_priority: check_task.task_priority,
                        task_createdOn: check_task.task_createdOn,
                        reporter: check_task.reporter,
                        task_assignee: check_task.task_assignee,
                        task_createdBy: check_task.task_createdBy,
                        number_of_subtasks: check_task.subtasks.length,
                        percentage: percentage,


                    })

                    responseData(res, "Task found successfully", 200, true, "", response)
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
        const actual_task_start_date = req.body.actual_task_start_date;
        const estimated_task_start_date = req.body.estimated_task_start_date;
        const estimated_task_end_date = req.body.estimated_task_end_date;
        const actual_task_end_date = req.body.actual_task_end_date;
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
        else if (!task_id) {
            responseData(res, "", 404, false, "Task Id required", [])
        }
        else if (!task_priority) {
            responseData(res, "", 404, false, "task priority required", [])

        }
        else if (!actual_task_start_date && !estimated_task_start_date) {
            responseData(res, "", 404, false, "Task start date  required", [])
        }
        else if (!actual_task_end_date && !estimated_task_end_date) {
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
                    const check_task = await taskModel.findOne({ task_id: task_id })
                    if (!check_task) {
                        responseData(res, "", 404, false, "Task not found", [])
                    }
                    else {
                        const update_task = await taskModel.findOneAndUpdate({ task_id: task_id, project_id: project_id },
                            {
                                $set: {
                                    task_name: task_name,
                                    task_description: task_description,
                                    actual_task_start_date: actual_task_start_date,
                                    actual_task_end_date: actual_task_end_date,
                                    estimated_task_end_date: estimated_task_end_date,
                                    estimated_task_start_date: estimated_task_start_date,
                                    task_status: task_status,
                                    task_priority: task_priority,
                                    task_assignee: task_assignee,
                                    reporter: reporter,
                                },
                                $push: {
                                    task_updatedBy: {
                                        task_updatedBy: check_user.username,
                                        role: check_user.role,
                                        task_updatedOn: new Date()
                                    }

                                }
                            },
                            { new: true, useFindAndModify: false }

                        )

                        if (update_task) {
                            await projectModel.findOneAndUpdate({ project_id: project_id },
                                {
                                    $push: {
                                        project_updated_by: {
                                            username: check_user.username,
                                            role: check_user.role,
                                            message: `has updated task ${task_name}.`,
                                            updated_date: new Date()
                                        }
                                    }
                                }
                            )


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
        else {
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
                    const check_task = await taskModel.findOne({ task_id: task_id, project_id: project_id });
                    if (!check_task) {
                        responseData(res, "", 404, false, "Task not found", [])
                    }
                    else {
                        await projectModel.findOneAndUpdate({ project_id: project_id },
                            {
                                $push: {
                                    project_updated_by: {
                                        username: check_user.username,
                                        role: check_user.role,
                                        message: `has deleted task ${check_task.task_name}.`,
                                        updated_date: new Date()
                                    }
                                }
                            }
                        )
                        const delete_task = await taskModel.findOneAndDelete({ task_id: task_id, project_id: project_id })
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


export const getAllTaskWithData = async (req, res) => {
    try {
        const project_id = req.query.project_id
        if (!project_id) {
            responseData(res, "", 404, false, "Project id is required", [])
        }
        else {
            const check_project = await projectModel.findOne({ project_id: project_id });
            if (!check_project) {
                responseData(res, "", 404, false, "Project not found", [])
            }
            else {
                const check_task = await taskModel.find({ project_id: project_id });
                if (!check_task) {
                    responseData(res, "", 404, false, "Task not found", [])
                }
                else {
                    let response = []

                    for (let i = 0; i < check_task.length; i++) {
                        let count = 0;
                        let percentage;
                        let total_length = check_task[i].subtasks.length;
                        for (let j = 0; j < check_task[i].subtasks.length; j++) {

                            if (check_task[i].subtasks[j].sub_task_status === 'Completed') {
                                count++;
                            }
                            if (check_task[i].subtasks[j].sub_task_status === 'Cancelled') {
                                total_length--;
                            }
                        }
                        percentage = (count / total_length) * 100;

                        response.push({
                            task_name: check_task[i].task_name,
                            percentage: percentage


                        })
                    }
                    responseData(res, "Task found", 200, true, "", response)
                }
            }
        }
    }
    catch (err) {
        console.log(err)
        res.send(err)
    }

}

