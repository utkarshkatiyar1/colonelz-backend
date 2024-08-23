import { responseData } from "../../../utils/respounse.js";
import registerModel from "../../../models/usersModels/register.model.js";
import projectModel from "../../../models/adminModels/project.model.js";
import taskModel from "../../../models/adminModels/task.model.js";
import { onlyAlphabetsValidation } from "../../../utils/validation.js";
import timerModel from "../../../models/adminModels/timer.Model.js";


function generateSixDigitNumber() {
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomNumber;
}
const createSubTaskAndTimer = async (data, res) => {
    try {
        const { project_id, task_id, sub_task_name, sub_task_description, actual_sub_task_start_date,
            estimated_sub_task_start_date, estimated_sub_task_end_date, actual_sub_task_end_date,
            sub_task_status, sub_task_priority, sub_task_assignee, sub_task_reporter, check_user, check_task } = data;

        const sub_task_id = `STK-${generateSixDigitNumber()}`;

        const update_task = await taskModel.findOneAndUpdate({ task_id: task_id, project_id: project_id }, {
            $push: {
                subtasks: {
                    sub_task_id, sub_task_name, sub_task_description,
                    estimated_sub_task_end_date, estimated_sub_task_start_date,
                    actual_sub_task_end_date, actual_sub_task_start_date,
                    sub_task_status, sub_task_priority, sub_task_assignee,
                    sub_task_createdBy: check_user.username, sub_task_createdOn: new Date(),
                    sub_task_reporter
                }
            }
        }, { new: true, useFindAndModify: false });

        if (update_task) {
            await timerModel.findOneAndUpdate({ project_id: project_id, task_id: task_id }, {
                $push: {
                    subtaskstime: {
                        sub_task_id, sub_task_name, sub_task_assignee, sub_task_time: ''
                    }
                }
            });

            await projectModel.findOneAndUpdate({ project_id: project_id }, {
                $push: {
                    project_updated_by: {
                        username: check_user.username, role: check_user.role,
                        message: `has created new subtask ${sub_task_name} in task ${check_task.task_name}.`,
                        updated_date: new Date()
                    }
                }
            });

            responseData(res, "Sub Task added successfully", 200, true, "", []);
        } else {
            responseData(res, "", 404, false, "Sub Task not added", []);
        }
    } catch (err) {
        console.log(err);
        res.send(err);
    }
}

export const createSubTask = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const project_id = req.body.project_id;
        const task_id = req.body.task_id;
        const sub_task_name = req.body.sub_task_name;
        const sub_task_description = req.body.sub_task_description;
        const actual_sub_task_start_date = req.body.actual_sub_task_start_date;
        const estimated_sub_task_start_date = req.body.estimated_sub_task_start_date;
        const estimated_sub_task_end_date = req.body.estimated_sub_task_end_date;
        const actual_sub_task_end_date = req.body.actual_sub_task_end_date;
        const sub_task_status = req.body.sub_task_status;
        const sub_task_priority = req.body.sub_task_priority;
        const sub_task_assignee = req.body.sub_task_assignee;
        const sub_task_reporter = req.body.sub_task_reporter;

        if (!user_id) return responseData(res, "", 404, false, "User Id required", []);
        if (!project_id) return responseData(res, "", 404, false, "Project Id required", []);
        if (!task_id) return responseData(res, "", 404, false, "Task Id required", []);
        if (!sub_task_name || !onlyAlphabetsValidation(sub_task_name) || sub_task_name.length <= 3)
            return responseData(res, "", 404, false, "Subtask Name should be alphabets and more than 3 characters", []);
        if (!sub_task_priority) return responseData(res, "", 404, false, "Subtask priority required", []);
        if (!estimated_sub_task_start_date) return responseData(res, "", 404, false, "Subtask start date required", []);
        if (!estimated_sub_task_end_date) return responseData(res, "", 404, false, "Subtask end date required", []);
        if (!sub_task_status) return responseData(res, "", 404, false, "Subtask status required", []);
        if (!sub_task_assignee) return responseData(res, "", 404, false, "Subtask assignee required", []);
        if (!sub_task_reporter) return responseData(res, "", 404, false, "Subtask reporter required", []);

        // Check if user exists
        const check_user = await registerModel.findById({ _id: user_id });
        if (!check_user) return responseData(res, "", 404, false, "User not found", []);

        // Check if project exists
        const check_project = await projectModel.findOne({ project_id: project_id });
        if (!check_project) return responseData(res, "", 404, false, "Project not found", []);

        // Check if task exists
        const check_task = await taskModel.findOne({ task_id: task_id, project_id: project_id });
        if (!check_task) return responseData(res, "", 404, false, "Task not found", []);
        if (check_task.task_status === 'Cancelled') return responseData(res, "", 400, false, "The task has been canceled", []);

        // Ensure user is authorized
        if (![check_task.task_assignee, check_task.task_createdBy, "ADMIN", "SUPERADMIN"].includes(check_user.username))
            return responseData(res, "", 400, false, "You are not authorized to create this subtask", []);

        // Check if subtask assignee exists
        const check_assignee = await registerModel.findOne({ username: sub_task_assignee, status: true });
        if (!check_assignee) return responseData(res, "", 404, false, "Subtask assignee is not a registered user", []);

        // Check if subtask reporter exists
        const check_reporter = await registerModel.findOne({ username: sub_task_reporter, status: true });
        if (!check_reporter) return responseData(res, "", 404, false, "Subtask reporter is not a registered user", []);

        // Handle role-based project assignment checks
        const isAuthorizedAssignee = ["Senior Architect", "ADMIN"].includes(check_assignee.role);
        const isAuthorizedReporter = ["Senior Architect", "ADMIN"].includes(check_reporter.role);

        if (isAuthorizedAssignee && isAuthorizedReporter) {
            // Subtask can be created directly
            await createSubTaskAndTimer({
                project_id, task_id, sub_task_name, sub_task_description,
                actual_sub_task_start_date, estimated_sub_task_start_date,
                estimated_sub_task_end_date, actual_sub_task_end_date,
                sub_task_status, sub_task_priority, sub_task_assignee,
                sub_task_reporter, check_user, check_task
            }, res);
        }

        else if (isAuthorizedAssignee && !isAuthorizedReporter) {
            const isReporterInProject = check_reporter.data[0].projectData.some(item => item.project_id === project_id);
            if (!isReporterInProject) return responseData(res, "", 404, false, "Subtask reporter is not part of this project", []);

            await createSubTaskAndTimer({
                project_id, task_id, sub_task_name, sub_task_description,
                actual_sub_task_start_date, estimated_sub_task_start_date,
                estimated_sub_task_end_date, actual_sub_task_end_date,
                sub_task_status, sub_task_priority, sub_task_assignee,
                sub_task_reporter, check_user, check_task
            }, res);
        }

        else if (!isAuthorizedAssignee && isAuthorizedReporter) {
            const isAssigneeInProject = check_assignee.data[0].projectData.some(item => item.project_id === project_id);
            if (!isAssigneeInProject) return responseData(res, "", 404, false, "Subtask assignee is not part of this project", []);

            await createSubTaskAndTimer({
                project_id, task_id, sub_task_name, sub_task_description,
                actual_sub_task_start_date, estimated_sub_task_start_date,
                estimated_sub_task_end_date, actual_sub_task_end_date,
                sub_task_status, sub_task_priority, sub_task_assignee,
                sub_task_reporter, check_user, check_task
            }, res);
        }
        else {
            // Ensure both assignee and reporter are part of the project
            const isAssigneeInProject = check_assignee.data[0].projectData.some(item => item.project_id === project_id);
            if (!isAssigneeInProject) return responseData(res, "", 404, false, "Subtask assignee is not part of this project", []);

            const isReporterInProject = check_reporter.data[0].projectData.some(item => item.project_id === project_id);
            if (!isReporterInProject) return responseData(res, "", 404, false, "Subtask reporter is not part of this project", []);

            await createSubTaskAndTimer({
                project_id, task_id, sub_task_name, sub_task_description,
                actual_sub_task_start_date, estimated_sub_task_start_date,
                estimated_sub_task_end_date, actual_sub_task_end_date,
                sub_task_status, sub_task_priority, sub_task_assignee,
                sub_task_reporter, check_user, check_task
            }, res);
        }
    } catch (err) {
        console.log(err);
        res.send(err);
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
        else {

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
                        responseData(res, "Task not found", 200, false, "", [])
                    }
                    else {
                        let response = []
                        let count = 0;
                        for (let i = 0; i < check_task.subtasks.length; i++) {


                            response.push({
                                task_id: task_id,
                                sub_task_id: check_task.subtasks[i].sub_task_id,
                                sub_task_name: check_task.subtasks[i].sub_task_name,
                                sub_task_description: check_task.subtasks[i].sub_task_description,
                                actual_sub_task_start_date: check_task.subtasks[i].actual_sub_task_start_date,
                                actual_sub_task_end_date: check_task.subtasks[i].actual_sub_task_end_date,
                                estimated_sub_task_end_date: check_task.subtasks[i].estimated_sub_task_end_date,
                                estimated_sub_task_start_date: check_task.subtasks[i].estimated_sub_task_start_date,
                                sub_task_status: check_task.subtasks[i].sub_task_status,
                                sub_task_priority: check_task.subtasks[i].sub_task_priority,
                                sub_task_assignee: check_task.subtasks[i].sub_task_assignee,
                                sub_task_createdBy: check_task.subtasks[i].sub_task_createdBy,
                                sub_task_createdOn: check_task.subtasks[i].sub_task_createdOn,
                                sub_task_reporter: check_task.subtasks[i].sub_task_reporter,
                                remark: check_task.subtasks[i].remark

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
        else {
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
                            return responseData(res, "Sub-task not found", 200, false, "", []);
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
        const actual_sub_task_start_date = req.body.actual_sub_task_start_date;
        const estimated_sub_task_start_date = req.body.estimated_sub_task_start_date;
        const estimated_sub_task_end_date = req.body.estimated_sub_task_end_date;
        const actual_sub_task_end_date = req.body.actual_sub_task_end_date;
        const sub_task_status = req.body.sub_task_status;
        const sub_task_priority = req.body.sub_task_priority;
        const sub_task_assignee = req.body.sub_task_assignee;
        const sub_task_reporter = req.body.sub_task_reporter;
        const remark = req.body.remark;


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
        else if (!estimated_sub_task_start_date) {
            responseData(res, "", 404, false, "Sub task start date  required", [])
        }
        else if (!estimated_sub_task_end_date) {
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

        else {
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
                    const check_task = await taskModel.findOne({ task_id: task_id, project_id: project_id })
                    if (!check_task) {
                        responseData(res, "", 404, false, "Task not found", [])
                    }


                    else {
                        if (check_task.task_status === 'Cancelled') {
                            responseData(res, "", 400, false, "The task has been canceled")
                        }
                        else {
                            if (check_task.task_assignee === check_user.username || check_task.task_createdBy === check_user.username || check_user.role === "ADMIN" || check_user.role === "SUPERADMIN") {


                                let update_subtask

                                if (sub_task_status === 'Under Revision') {
                                    if (!remark) {
                                        responseData(res, "", 404, false, "Please enter remark ", [])
                                    }
                                    update_subtask = await taskModel.findOneAndUpdate({
                                        task_id: task_id,
                                        project_id: project_id,
                                        "subtasks.sub_task_id": sub_task_id
                                    },
                                        {
                                            $set: {
                                                "subtasks.$.sub_task_name": sub_task_name,
                                                "subtasks.$.sub_task_description": sub_task_description,
                                                "subtasks.$.estimated_sub_task_start_date": estimated_sub_task_start_date,
                                                "subtasks.$.actual_sub_task_start_date": actual_sub_task_start_date,
                                                "subtasks.$.estimated_sub_task_end_date": estimated_sub_task_end_date,
                                                "subtasks.$.actual_sub_task_end_date": actual_sub_task_end_date,
                                                "subtasks.$.sub_task_status": sub_task_status,
                                                "subtasks.$.sub_task_priority": sub_task_priority,
                                                "subtasks.$.sub_task_assignee": sub_task_assignee,
                                                "subtasks.$.sub_task_reporter": sub_task_reporter
                                            },
                                            $push: {
                                                "subtasks.$.sub_task_updatedBy": {
                                                    sub_task_updatedBy: check_user.username,
                                                    role: check_user.role,
                                                    sub_task_updatedOn: new Date()
                                                },
                                                "subtasks.$.remark": {
                                                    remark: remark,
                                                    remark_by: check_user.username,
                                                    remark_date: new Date()
                                                }
                                            }
                                        },
                                        { new: true, useFindAndModify: false }
                                    )
                                }
                                else {
                                    update_subtask = await taskModel.findOneAndUpdate({
                                        task_id: task_id,
                                        project_id: project_id,
                                        "subtasks.sub_task_id": sub_task_id
                                    },
                                        {
                                            $set: {
                                                "subtasks.$.sub_task_name": sub_task_name,
                                                "subtasks.$.sub_task_description": sub_task_description,
                                                "subtasks.$.estimated_sub_task_start_date": estimated_sub_task_start_date,
                                                "subtasks.$.actual_sub_task_start_date": actual_sub_task_start_date,
                                                "subtasks.$.estimated_sub_task_end_date": estimated_sub_task_end_date,
                                                "subtasks.$.actual_sub_task_end_date": actual_sub_task_end_date,
                                                "subtasks.$.sub_task_status": sub_task_status,
                                                "subtasks.$.sub_task_priority": sub_task_priority,
                                                "subtasks.$.sub_task_assignee": sub_task_assignee,
                                                "subtasks.$.sub_task_reporter": sub_task_reporter
                                            },
                                            $push: {
                                                "subtasks.$.sub_task_updatedBy": {
                                                    sub_task_updatedBy: check_user.username,
                                                    role: check_user.role,
                                                    sub_task_updatedOn: new Date()
                                                },
                                            }
                                        },
                                        { new: true, useFindAndModify: false }
                                    )
                                }
                                if (update_subtask) {
                                    await projectModel.findOneAndUpdate({ project_id: project_id },
                                        {
                                            $push: {
                                                project_updated_by: {
                                                    username: check_user.username,
                                                    role: check_user.role,
                                                    message: ` has updated subtask ${sub_task_name} in task ${check_task.task_name}.`,
                                                    updated_date: new Date()
                                                }

                                            }
                                        }
                                    )

                                    if (sub_task_status === 'Completed' || sub_task_status === 'Cancelled') {
                                        let current_time ;
                                        let total_time ;
                                        const find_timer = await timerModel.findOne({
                                            task_id: task_id,
                                            project_id: project_id,
                                            'subtaskstime.sub_task_id': sub_task_id,
                                        })

                                        for (let i = 0; i < find_timer.subtaskstime.length; i++) {
                                            if (find_timer.subtaskstime[i].sub_task_id === sub_task_id) {
                                                console.log(find_timer.subtaskstime[i].sub_task_isrunning)
                                                if (find_timer.subtaskstime[i].sub_task_isrunning) {
                                                    current_time = new Date().getTime() - find_timer.subtaskstime[i].sub_task_current;
                                                    total_time = find_timer.subtaskstime[i].sub_task_time + current_time
                                                    console.log(current_time)
                                                    console.log(total_time)
                                                    await timerModel.findOneAndUpdate({
                                                        task_id: task_id,
                                                        project_id: project_id,
                                                        'subtaskstime.sub_task_id': sub_task_id
                                                    },
                                                        {
                                                            $set: {

                                                                'subtaskstime.$.sub_task_isrunning': false,
                                                                'subtaskstime.$.sub_task_current':current_time ,
                                                                'subtaskstime.$.sub_task_time': total_time

                                                            }
                                                        },
                                                        { new: true, useFindAndModify: false }
                                                    )
                                                    
                                                }


                                            }
                                        }
                                     
                                    }
                                    responseData(res, "Sub Task Updated Successfully", 200, true, "", [])
                                }
                                else {
                                    responseData(res, "", 404, false, "Sub Task Not Updated", [])
                                }
                            }
                            else {
                                responseData(res, "", 404, false, "Sub Task Not Updated because you are not Admin or task Assignee", [])
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
        else {
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
                    const check_task = await taskModel.findOne({ task_id: task_id, project_id: project_id })
                    if (!check_task) {
                        responseData(res, "", 404, false, "Task not found", [])
                    }
                    else {
                        const check_subtask = check_task.subtasks.find((subtask) => subtask.sub_task_id == sub_task_id)
                        await projectModel.findOneAndUpdate({ project_id: project_id },
                            {
                                $push: {
                                    project_updated_by: {
                                        username: check_user.username,
                                        role: check_user.role,
                                        message: ` has deleted subtask ${check_subtask.sub_task_name} in task ${check_task.task_name}.`,
                                        updated_date: new Date()
                                    }
                                }
                            }
                        )
                        const delete_subtask = await taskModel.findOneAndUpdate({
                            task_id: task_id,
                            project_id: project_id,
                            "subtasks.sub_task_id": sub_task_id
                        },
                            {
                                $pull: { "subtasks": { "sub_task_id": sub_task_id } },


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