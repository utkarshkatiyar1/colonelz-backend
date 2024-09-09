import { responseData } from "../../../utils/respounse.js";
import projectModel from "../../../models/adminModels/project.model.js";
import taskModel from "../../../models/adminModels/task.model.js";
import registerModel from "../../../models/usersModels/register.model.js";
import { onlyAlphabetsValidation } from "../../../utils/validation.js";
import timerModel from "../../../models/adminModels/timer.Model.js";


function generateSixDigitNumber() {
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomNumber;
}

const createTaskAndTimer = async (res, check_user, task_assignee, project_id, task_name, task_description, actual_task_start_date, estimated_task_start_date, estimated_task_end_date, task_status, task_priority, reporter) => {
    const task_id = `TK-${generateSixDigitNumber()}`;

    const task = new taskModel({
        project_id,
        task_id,
        task_name,
        task_description,
        actual_task_start_date,
        actual_task_end_date: "",
        estimated_task_start_date,
        estimated_task_end_date,
        task_status,
        task_priority,
        task_assignee,
        task_createdBy: check_user.username,
        task_createdOn: new Date(),
        reporter,
        subtasks: []
    });

    const taskTime = new timerModel({
        project_id,
        task_id,
        task_name,
        task_assignee,
        task_time: '',
        subtaskstime: []
    });

    await task.save();
    await taskTime.save();

    await projectModel.findOneAndUpdate(
        { project_id },
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
    );

    responseData(res, "Task created successfully", 200, true, "", []);
};
export const createTask = async (req, res) => {

    try {
        const user_id = req.body.user_id;
        const project_id = req.body.project_id;
        const task_name = req.body.task_name;
        const task_description = req.body.task_description;
        const actual_task_start_date = req.body.actual_task_start_date;
        const estimated_task_start_date = req.body.estimated_task_start_date;
        const estimated_task_end_date = req.body.estimated_task_end_date;
        const task_status = req.body.task_status;
        const task_priority = req.body.task_priority;
        const task_assignee = req.body.task_assignee;
        const reporter = req.body.reporter;

        if (!user_id) return responseData(res, "", 404, false, "User Id required", []);
        if (!project_id) return responseData(res, "", 404, false, "Project Id required", []);
        if (!onlyAlphabetsValidation(task_name) || task_name.length < 3) {
            return responseData(res, "", 404, false, "Task Name should be alphabets and at least 3 characters long", []);
        }
        if (!task_priority) return responseData(res, "", 404, false, "Task priority required", []);
        if (!estimated_task_start_date) return responseData(res, "", 404, false, "Task start date required", []);
        if (!estimated_task_end_date) return responseData(res, "", 404, false, "Task end date required", []);
        if (!task_status) return responseData(res, "", 404, false, "Task status required", []);
        if (!task_assignee) return responseData(res, "", 404, false, "Task assignee required", []);
        if (!reporter) return responseData(res, "", 404, false, "Task reporter required", []);

        // Check if the user exists
        const check_user = await registerModel.findById({ _id: user_id });
        if (!check_user) return responseData(res, "", 404, false, "User not found", []);

        // Check if the project exists
        const check_project = await projectModel.findOne({ project_id });
        if (!check_project) return responseData(res, "", 404, false, "Project not found", []);

        // Check if the assignee exists and is active
        const check_assignee = await registerModel.findOne({ username: task_assignee, status: true });
        if (!check_assignee) return responseData(res, "", 404, false, "Task assignee is not a registered user", []);

        // Check if the reporter exists and is active
        const check_reporter = await registerModel.findOne({ username: reporter, status: true });
        if (!check_reporter) return responseData(res, "", 404, false, "Task reporter is not a registered user", []);

        // Validate roles and project association
        const isSeniorOrAdmin = (user) => ['Senior Architect', 'ADMIN'].includes(user.role);

        if (isSeniorOrAdmin(check_assignee) && isSeniorOrAdmin(check_reporter)) {
            // Create task if both assignee and reporter are Senior Architect or ADMIN
            await createTaskAndTimer(res, check_user, task_assignee, project_id, task_name, task_description, actual_task_start_date, estimated_task_start_date, estimated_task_end_date, task_status, task_priority, reporter);
        }

        else if (!isSeniorOrAdmin(check_assignee) && isSeniorOrAdmin(check_reporter)) {
            // Create task if both assignee and reporter are Senior Architect or ADMIN
            const existProject = check_assignee.data[0].projectData.find((item) => item.project_id === project_id);
            if (!existProject) return responseData(res, "", 404, false, "Task assignee is not part of this project", []);

            await createTaskAndTimer(res, check_user, task_assignee, project_id, task_name, task_description, actual_task_start_date, estimated_task_start_date, estimated_task_end_date, task_status, task_priority, reporter);
        }
        else if (isSeniorOrAdmin(check_assignee) && !isSeniorOrAdmin(check_reporter)) {
            // Create task if both assignee and reporter are Senior Architect or ADMIN
            const exitsreportproject = check_reporter.data[0].projectData.find((item) => item.project_id === project_id);
            if (!exitsreportproject) return responseData(res, "", 404, false, "Reporter is not part of this project", []);


            await createTaskAndTimer(res, check_user, task_assignee, project_id, task_name, task_description, actual_task_start_date, estimated_task_start_date, estimated_task_end_date, task_status, task_priority, reporter);
        }

        else {
            // Check project association for assignee and reporter
            const existProject = check_assignee.data[0].projectData.find((item) => item.project_id === project_id);
            if (!existProject) return responseData(res, "", 404, false, "Task assignee is not part of this project", []);

            const exitsreportproject = check_reporter.data[0].projectData.find((item) => item.project_id === project_id);
            if (!exitsreportproject) return responseData(res, "", 404, false, "Reporter is not part of this project", []);

            // Create task if validation passes
            await createTaskAndTimer(res, check_user, task_assignee, project_id, task_name, task_description, actual_task_start_date, estimated_task_start_date, estimated_task_end_date, task_status, task_priority, reporter);
        }

    } catch (err) {
        console.log(err);
        res.status(500).send({ error: 'Internal Server Error', details: err });
    }

}
export const getAllTasks = async (req, res) => {
    try {
        const { user_id, project_id } = req.query;

        if (!user_id || !project_id) {
            const missingField = !user_id ? "User Id" : "Project Id";
            return responseData(res, "", 404, false, `${missingField} required`, []);
        }

        const check_user = await registerModel.findById(user_id);
        if (!check_user) {
            return responseData(res, "", 404, false, "User not found", []);
        }

        const check_project = await projectModel.findOne({ project_id });
        if (!check_project) {
            return responseData(res, "", 404, false, "Project not found", []);
        }

        // Fetch tasks
        const tasks = await taskModel.find({ project_id });
        if (!tasks.length) {
            return responseData(res, "Tasks not found", 200, false, "", []);
        }

        // Process each task and update status if necessary
        for (let task of tasks) {
            const { subtasks } = task;
            
            // Skip tasks with no subtasks
            if (!subtasks.length) {
                continue;
            }

            // Determine if all subtasks are completed or cancelled
            const allSubtasksCompleted = subtasks.every(subtask =>
                subtask.sub_task_status === 'Completed' || subtask.sub_task_status === 'Cancelled'
            );

            if (allSubtasksCompleted) {
                // Update task status to completed
                await taskModel.findOneAndUpdate(
                    { task_id: task.task_id },
                    { $set: { task_status: "Completed",
                        actual_task_end_date: new Date()
                     } },
                    { new: true } // Ensure the updated task is returned
                );
            }
        }

        // Fetch the updated tasks
        const updatedTasks = await taskModel.find({ project_id });

        // Construct response
        const response = updatedTasks.map(task => ({
            project_id: task.project_id,
            task_id: task.task_id,
            task_name: task.task_name,
            actual_task_start_date: task.actual_task_start_date,
            actual_task_end_date: task.actual_task_end_date,
            estimated_task_end_date: task.estimated_task_end_date,
            estimated_task_start_date: task.estimated_task_start_date,
            task_status: task.task_status,
            task_priority: task.task_priority,
        }));

        responseData(res, "Tasks found successfully", 200, true, "", response);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
};





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
        else if (!estimated_task_start_date) {
            responseData(res, "", 404, false, "Task start date  required", [])
        }
        else if (!estimated_task_end_date) {
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



