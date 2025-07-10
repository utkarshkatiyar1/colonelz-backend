import { responseData } from "../../../utils/respounse.js";
import projectModel from "../../../models/adminModels/project.model.js";
import taskModel from "../../../models/adminModels/task.model.js";
import registerModel from "../../../models/usersModels/register.model.js";
import { onlyAlphabetsValidation } from "../../../utils/validation.js";
import timerModel from "../../../models/adminModels/timer.Model.js";
import orgModel from "../../../models/orgmodels/org.model.js";
import cron from "node-cron";
import { send_mail, send_mail_subtask_cronjob, send_mail_task_cronjob } from "../../../utils/mailtemplate.js";
import jwt from "jsonwebtoken";
import leadModel from "../../../models/adminModels/leadModel.js";
import leadTaskModel from "../../../models/adminModels/leadTask.model.js";
import openTaskModel from "../../../models/adminModels/openTask.model.js";




function generateSixDigitNumber() {
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomNumber;
}



const createTaskAndTimer = async (res, req, org_id, check_user, task_assignee, project_id, task_name, task_description, estimated_task_end_date, task_status, task_priority, reporter) => {
    const task_id = `TK-${generateSixDigitNumber()}`;

    const task = new taskModel({
        project_id,
        task_id,
        org_id,
        task_name,
        task_description,
        task_note : "",
        estimated_task_end_date,
        task_status,
        task_priority,
        task_assignee,
        task_createdBy: check_user.username,
        task_createdOn: new Date(),
        reporter: reporter || check_user.username,
        subtasks: [],
        minitasks: [],
    });

    const taskTime = new timerModel({
        project_id,
        task_id,
        org_id,
        task_name,
        task_assignee,
        task_time: '',
        subtaskstime: [],
        taskstime: [],
        minitaskstime: [],
    });

    await task.save();
    await taskTime.save();

    const project_data = await projectModel.findOneAndUpdate(
        { project_id: project_id, org_id: org_id },
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

    const updateTimer = await timerModel.findOneAndUpdate({ project_id: project_id, task_id: task_id, org_id: org_id }, {
        $push: {
            taskstime: {
                task_id, task_name, task_assignee, task_time: ''
            }
        }
    });

    if (!updateTimer) {
        return responseData(res, "Task timer not found", 404, false, "", []);

    }

    if (task_assignee !== '') {
        const find_user = await registerModel.findOne({ organization: project_data.org_id, username: task_assignee });
        const find_reporter = await registerModel.findOne({ organization: project_data.org_id, username: reporter })
        await send_mail(find_user.email, task_assignee, task_name, project_data.project_name, estimated_task_end_date, task_priority, task_status, reporter, find_reporter?.email || 'None', req.user.username, "project");
    }

    responseData(res, "Task created successfully", 200, true, "", []);
};
export const createTask = async (req, res) => {

    try {
        const user_id = req.body.user_id;
        const org_id = req.body.org_id;
        const project_id = req.body.project_id;
        const task_name = req.body.task_name;
        const task_description = req.body.task_description;
        // const estimated_task_start_date = req.body.estimated_task_start_date;
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
        // if (!estimated_task_start_date) return responseData(res, "", 404, false, "Task start date required", []);
        if (!estimated_task_end_date) return responseData(res, "", 404, false, "Task end date required", []);
        if (!task_status) return responseData(res, "", 404, false, "Task status required", []);
        // if (!task_assignee) return responseData(res, "", 404, false, "Task assignee required", []);
        // if (!reporter) return responseData(res, "", 404, false, "Task reporter required", []);
        if (!org_id) return responseData(res, "", 400, false, "Org Id required");
        // Check if the user exists
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }
        const check_user = await registerModel.findOne({ _id: user_id, organization: org_id });
        if (!check_user) return responseData(res, "", 404, false, "User not found", []);

        // Check if the project exists
        const check_project = await projectModel.findOne({ project_id: project_id, org_id: org_id });
        if (!check_project) return responseData(res, "", 404, false, "Project not found", []);




        // Check if the assignee exists and is active
        let check_assignee = {};

        if (task_assignee !== '') {
            check_assignee = await registerModel.findOne({ username: task_assignee, status: true, organization: org_id });
            if (!check_assignee) return responseData(res, "", 404, false, "Task assignee is not a registered user", []);
        }

        // Check if the reporter exists and is active

        let check_reporter = {};

        if (reporter !== '') {
            check_reporter = await registerModel.findOne({ username: reporter, status: true, organization: org_id });
            if (!check_reporter) return responseData(res, "", 404, false, "Task reporter is not a registered user", []);
        }

        // Validate roles and project association
        const isSeniorOrAdmin = (user) => {
            if (!user || user == {}) {
                return false;
            }
            return ['Senior Architect', 'ADMIN', 'SUPERADMIN'].includes(user.role)
        };

        if (isSeniorOrAdmin(check_assignee) && isSeniorOrAdmin(check_reporter)) {
            // Create task if both assignee and reporter are Senior Architect or ADMIN
            await createTaskAndTimer(res, req, org_id, check_user, task_assignee, project_id, task_name, task_description, estimated_task_end_date, task_status, task_priority, reporter);
        }

        else if (!isSeniorOrAdmin(check_assignee) && isSeniorOrAdmin(check_reporter)) {
            // Create task if both assignee and reporter are Senior Architect or ADMIN

            if (task_assignee !== '') {
                const existProject = check_assignee.data[0].projectData.find((item) => item.project_id === project_id);
                if (!existProject) return responseData(res, "", 404, false, "Task assignee is not part of this project", []);
            }

            await createTaskAndTimer(res, req, org_id, check_user, task_assignee, project_id, task_name, task_description, estimated_task_end_date, task_status, task_priority, reporter);
        }
        else if (isSeniorOrAdmin(check_assignee) && !isSeniorOrAdmin(check_reporter)) {
            // Create task if both assignee and reporter are Senior Architect or ADMIN
            if (reporter !== '') {
                const exitsreportproject = check_reporter.data[0].projectData.find((item) => item.project_id === project_id);
                if (!exitsreportproject) return responseData(res, "", 404, false, "Reporter is not part of this project", []);
            }

            await createTaskAndTimer(res, req, org_id, check_user, task_assignee, project_id, task_name, task_description, estimated_task_end_date, task_status, task_priority, reporter);
        }

        else {
            // Check project association for assignee and reporter
            if (task_assignee !== '') {
                const existProject = check_assignee.data[0].projectData.find((item) => item.project_id === project_id);
                if (!existProject) return responseData(res, "", 404, false, "Task assignee is not part of this project", []);
            }

            if (reporter !== '') {
                const exitsreportproject = check_reporter.data[0].projectData.find((item) => item.project_id === project_id);
                if (!exitsreportproject) return responseData(res, "", 404, false, "Reporter is not part of this project", []);
            }
            // Create task if validation passes
            await createTaskAndTimer(res, req, org_id, check_user, task_assignee, project_id, task_name, task_description, estimated_task_end_date, task_status, task_priority, reporter);
        }





    } catch (err) {
        console.log(err);
        res.status(500).send({ error: 'Internal Server Error', details: err });
    }

}
export const getAllTasks = async (req, res) => {
    try {
        const { user_id, project_id, org_id } = req.query;

        if (!user_id || !project_id) {
            const missingField = !user_id ? "User Id" : "Project Id";
            return responseData(res, "", 404, false, `${missingField} required`, []);
        }
        if (!org_id) {
            return responseData(res, "", 400, false, "Org Id required");
        }

        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }
        const check_user = await registerModel.findOne({ _id: user_id, organization: org_id });
        if (!check_user) {
            return responseData(res, "", 404, false, "User not found", []);
        }

        const check_project = await projectModel.findOne({ project_id: project_id, org_id: org_id });
        if (!check_project) {
            return responseData(res, "", 404, false, "Project not found", []);
        }

        // Fetch tasks
        const tasks = await taskModel.find({ project_id: project_id, org_id: org_id });
        if (!tasks.length) {
            return responseData(res, "Tasks not found", 200, false, "", []);
        }
        for (let task of tasks) {
            const { subtasks } = task;

            if (!subtasks.length) {
                continue;
            }
            const allSubtasksCompleted = subtasks.every(subtask =>
                subtask.sub_task_status === 'Completed' || subtask.sub_task_status === 'Cancelled'
            );

            const allSubtasksCancelled = subtasks.every(subtask =>
                subtask.sub_task_status === 'Cancelled'
            );

            let newTaskStatus;
            if (allSubtasksCancelled) {
                newTaskStatus = 'In Progress';
            } else if (allSubtasksCompleted) {
                newTaskStatus = 'Completed';
            } else {
                newTaskStatus = 'In Progress';
            }

            if (newTaskStatus !== task.task_status) {
                await taskModel.findOneAndUpdate(
                    { task_id: task.task_id, org_id: org_id },
                    {
                        $set: {
                            task_status: newTaskStatus,
                            estimated_task_end_date: newTaskStatus === 'Completed' ? new Date() : estimated_task_end_date
                        }
                    },
                    { new: true } 
                );
            }
        }

        const updatedTasks = await taskModel.find({ project_id: project_id, org_id: org_id });
        const response = updatedTasks.map(task => ({
            project_id: task.project_id,
            task_id: task.task_id,
            task_name: task.task_name,
            estimated_task_end_date: task.estimated_task_end_date,
            task_status: task.task_status,
            task_priority: task.task_priority,
            task_createdOn: task.task_createdOn,
            task_createdBy: task.task_createdBy,
            task_assignee: task.task_assignee,
            reporter: task.reporter,
            task_description: task.task_description,
            task_note: task?.task_note || ""


        }));

        responseData(res, "Tasks found successfully", 200, true, "", response);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
};





export const getSingleTask = async (req, res) => {
    try {
        const { user_id, project_id, task_id, org_id } = req.query;


        if (!user_id || !project_id || !task_id || !org_id) {
            return responseData(res, "", 400, false, "User ID, Project ID, and Task ID, Org ID are required", []);
        }

   
        const result = await taskModel.aggregate([
            {
                $match: {
                    task_id: task_id,
                    project_id: project_id,
                    org_id: org_id
                },
            },
            {
                $lookup: {
                    from: "projects", 
                    localField: "project_id",
                    foreignField: "project_id",
                    as: "project_info",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "task_assignee",
                    foreignField: "_id",
                    as: "assignee_info",
                },
            },
            {
                $project: {
                    project_id: 1,
                    task_id: 1,
                    task_name: 1,
                    task_description: 1,
                    task_note: 1,
                    estimated_task_end_date: 1,
                    task_status: 1,
                    task_priority: 1,
                    task_createdOn: 1,
                    reporter: 1,
                    task_assignee: 1,
                    task_createdBy: 1,
                    number_of_subtasks: { $size: "$subtasks" },
                    project_name: { $arrayElemAt: ["$project_info.project_name", 0] },
                    assignee_name: { $arrayElemAt: ["$assignee_info.name", 0] },
                },
            },
        ]);

        if (!result.length) {
            return responseData(res, "Task not found", 200, false, "", []);
        }

        responseData(res, "Task found successfully", 200, true, "", result);
    } catch (err) {
        console.error(err);
        return responseData(res, "", 500, false, "Internal server error", []);
    }
};



export const updateTask = async (req, res) => {

    try {
        const user_id = req.body.user_id;
        const org_id = req.body.org_id;
        const project_id = req.body.project_id;
        const task_name = req.body.task_name;
        const task_description = req.body.task_description;
        const task_note = req.body.task_note;
        const estimated_task_end_date = req.body.estimated_task_end_date;
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
        else if (!estimated_task_end_date) {
            responseData(res, "", 404, false, "Task end date required", [])
        }
        else if (!task_status) {
            responseData(res, "", 404, false, "Task status required", [])
        }
        // else if (!task_assignee) {
        //     responseData(res, "", 404, false, "Task assignee required", [])
        // }
        // else if (!reporter) {
        //     responseData(res, "", 404, false, "Task reporter required", [])
        // }
        else if (!org_id) {
            return responseData(res, "", 400, false, "Organization Id is required");
        }
        else {
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                return responseData(res, "", 404, false, "Org not found");
            }
            const check_user = await registerModel.findOne({ _id: user_id, organization: org_id })
            if (!check_user) {
                responseData(res, "", 404, false, "User not found", [])
            }
            else {
                const check_project = await projectModel.findOne({ project_id: project_id, org_id: org_id })
                if (!check_project) {
                    responseData(res, "", 404, false, "Project not found", [])
                }
                else {
                    const check_task = await taskModel.findOne({ task_id: task_id, org_id: org_id })
                    if (!check_task) {
                        responseData(res, "", 404, false, "Task not found", [])
                    }
                    else {
                        const previous_task_assignee = check_task.task_assignee;

                        let findUser;

                        if (task_assignee) {
                            findUser = await registerModel.findOne({ username: task_assignee, organization: org_id });
                            if (!findUser) {
                                return responseData(res, "", 404, false, "Task assignee not found", []);
                            }
                        }

                        const update_task = await taskModel.findOneAndUpdate({ task_id: task_id, project_id: project_id, org_id: org_id },
                            {
                                $set: {
                                    task_name: task_name,
                                    task_description: task_description,
                                    task_note: task_note,
                                    estimated_task_end_date: estimated_task_end_date,
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
                            await projectModel.findOneAndUpdate({ project_id: project_id, org_id: org_id },
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

                            if (task_assignee && previous_task_assignee !== task_assignee) {
                                const find_reporter = await registerModel.findOne({ organization: org_id, username: reporter })
                                await send_mail(findUser.email, task_assignee, task_name, check_project.project_name, estimated_task_end_date, task_priority, task_status, reporter, find_reporter.email, check_user.username, "project");
                            }
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
        const org_id = req.body.org_id;

        if (!user_id) {
            responseData(res, "", 404, false, "User Id required", [])
        }
        else if (!project_id) {
            responseData(res, "", 404, false, "Project Id required", [])
        }

        else if (!task_id) {
            responseData(res, "", 404, false, "Task Id required", [])
        }
        else if (!org_id) {
            return responseData(res, "", 400, false, "Organization Id is required");
        }
        else {
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                return responseData(res, "", 404, false, "Org not found");
            }
            const check_user = await registerModel.findOne({ _id: user_id, organization: org_id });
            if (!check_user) {
                responseData(res, "", 404, false, "User not found", [])
            }
            else {
                const check_project = await projectModel.findOne({ project_id: project_id, org_id: org_id });
                if (!check_project) {
                    responseData(res, "", 404, false, "Project not found", [])
                }
                else {
                    const check_task = await taskModel.findOne({ task_id: task_id, project_id: project_id, org_id: org_id });
                    if (!check_task) {
                        responseData(res, "", 404, false, "Task not found", [])
                    }
                    else {
                        await projectModel.findOneAndUpdate({ project_id: project_id, org_id: org_id },
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
                        const delete_task = await taskModel.findOneAndDelete({ task_id: task_id, project_id: project_id, org_id: org_id })
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
        const org_id = req.query.org_id;
        if (!project_id) {
            responseData(res, "", 404, false, "Project id is required", [])
        }
        else if (!org_id) {
            return responseData(res, "", 400, false, "Organization Id is required");
        }
        else {
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                return responseData(res, "", 404, false, "Org not found");
            }
            const check_project = await projectModel.findOne({ project_id: project_id, org_id: org_id });
            if (!check_project) {
                responseData(res, "", 404, false, "Project not found", [])
            }
            else {
                const check_task = await taskModel.find({ project_id: project_id, org_id: org_id });
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


export async function sendmail_cronjob() {
    try {
        console.log("Running cron job for overdue task emails...");

        const allOrgs = await registerModel.distinct("organization").maxTimeMS(20000).lean();

        for (const org_id of allOrgs) {
            console.log(`Processing tasks for organization: ${org_id}`);


            const [overdueTasks, overdueTaskslead, overdueTasksOpen] = await Promise.all([
                await taskModel.find({
                    org_id,
                    task_status: { $nin: ["Completed", "Cancelled"] },
                    estimated_task_end_date: { $lt: new Date() }
                }).lean(),

                await leadTaskModel.find({
                    org_id,
                    task_status: { $nin: ["Completed", "Cancelled"] },
                    estimated_task_end_date: { $lt: new Date() }
                }).lean(),
                await openTaskModel.find({
                    org_id,
                    task_status: { $nin: ["Completed", "Cancelled"] },
                    estimated_task_end_date: { $lt: new Date() }
                }).lean()
            ]);

            if (!overdueTasks.length && !overdueTaskslead.length && !overdueTasksOpen.length) {
                console.log(`No overdue tasks for organization: ${org_id}`);
                continue;
            }

            // Process all overdue tasks
            await Promise.all([
                processTasks(overdueTasks, org_id, taskModel, "project"),
                processTasks(overdueTaskslead, org_id, leadTaskModel, "lead"),
                processTasks(overdueTasksOpen, org_id, openTaskModel, "open")
            ]);
        }

        console.log("Cron job executed successfully.");
    } catch (err) {
        console.error("Error executing cron job:", err);
    }
}

// Helper function to process tasks
async function processTasks(tasks, org_id, model, taskType) {
    for (const task of tasks) {
        if (!task.task_assignee) {
            console.log(`No assignee found for ${taskType} task`);
            continue;
        }

        const find_user = await registerModel.findOne({ organization: org_id, username: task.task_assignee });

        const find_reporter = await registerModel.findOne({ organization: org_id, username: task.reporter });
        if (!find_user?.email) continue;
        if (!find_reporter?.email) continue;
        const find_admins = await registerModel.find({ organization: org_id, role: "ADMIN" });
        const find_superadmins = await registerModel.find({ organization: org_id, role: "SUPERADMIN" });



        // Update task status to "High"
        const task_data = await model.findOneAndUpdate(
            { task_id: task.task_id, org_id },
            { $set: { task_priority: "High" } },
            { new: true, useFindAndModify: false }
        ).lean();

        const relatedModel = taskType === "lead" ? leadModel : projectModel;
        const relatedData = taskType !== "open" ? await relatedModel.findOne({ [`${taskType}_id`]: task[`${taskType}_id`], org_id }) : null;
        const relatedName = taskType === "lead" ? relatedData?.name : relatedData?.project_name || "Open Type";

        const all_subtasks = task_data.subtasks.filter(subtask =>
            subtask.sub_task_status !== 'Completed' &&
            subtask.sub_task_assignee &&
            subtask.estimated_sub_task_end_date < new Date()
        );

        if (all_subtasks.length > 0) {
            await model.bulkWrite(all_subtasks.map(subtask => ({
                updateOne: {
                    filter: { task_id: task.task_id, org_id, "subtasks.sub_task_id": subtask.sub_task_id },
                    update: { $set: { "subtasks.$.sub_task_priority": "High" } }
                }
            })), { ordered: false });


            await Promise.all(all_subtasks.map(async (subtask) => {
                const find_subtask_assignee = await registerModel.findOne({ organization: org_id, username: subtask.sub_task_assignee });
                const find_subtask_reporter = await registerModel.findOne({ organization: org_id, username: subtask.sub_task_reporter });
                const sub_task_emails = new Set();
                if (find_subtask_assignee?.email) sub_task_emails.add(find_subtask_assignee.email);
                if (find_subtask_reporter?.email) sub_task_emails.add(find_subtask_reporter.email);
                find_admins.forEach(admin => {
                    if (admin?.email) sub_task_emails.add(admin.email);
                });
                find_superadmins.forEach(superadmin => {
                    if (superadmin?.email) sub_task_emails.add(superadmin.email);
                });
                await Promise.all([...sub_task_emails].map(email =>
                    send_mail_subtask_cronjob(
                        email,
                        subtask.sub_task_assignee,
                        subtask.sub_task_name,
                        relatedName,
                        subtask.estimated_sub_task_end_date,
                        "High",
                        subtask.sub_task_status,
                        subtask.sub_task_reporter,
                        task_data.task_name,
                        taskType
                    )
                ));
            }));

        }

        const emails = new Set();

        if (find_user?.email) emails.add(find_user.email);
        if (find_reporter?.email) emails.add(find_reporter.email);
        find_admins.forEach(admin => {
            if (admin?.email) emails.add(admin.email);
        });
        find_superadmins.forEach(superadmin => {
            if (superadmin?.email) emails.add(superadmin.email);
        });

        await Promise.all([...emails].map(email =>
            send_mail_task_cronjob(
                email,
                task_data.task_assignee,
                task_data.task_name,
                relatedName,
                task_data.estimated_task_end_date,
                task_data.task_priority,
                task_data.task_status,
                task_data.reporter,
                taskType
            )
        ));
    }
}




cron.schedule("0 0 * * *", async () => {
    try {

        await sendmail_cronjob();
        console.log("send email cron job executed successfully");
    } catch (error) {
        console.error("Error executing notification cron job:", error);
    }
});


