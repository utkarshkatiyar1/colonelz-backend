import { responseData } from "../../../utils/respounse.js";

import taskModel from "../../../models/adminModels/task.model.js";
import timerModel from "../../../models/adminModels/timer.Model.js";
import leadTaskModel from "../../../models/adminModels/leadTask.model.js";
import leadTimerModel from "../../../models/adminModels/leadTimer.Model.js";

export const UpdateLeadSubtimerController = async (req, res) => {
    try {
        const time = req.body.time;
        const isrunning = req.body.isrunning;
        const totalTime = req.body.total_time;
        const current = req.body.current;
        const lead_id = req.body.lead_id;
        const task_id = req.body.task_id;
        const sub_task_id = req.body.sub_task_id;
        const sub_task_assignee = req.body.sub_task_assignee;

        if (!time) {
            return responseData(res, "", 400, false, "Time is required")
        }
        else if (!lead_id) {
            return responseData(res, "", 400, false, "Lead id is required")
        }
        else if (!task_id) {
            return responseData(res, "", 400, false, "Task id is required")
        }
        else if (!sub_task_id) {
            return responseData(res, "", 400, false, "Sub task id is required")
        }

        else if (!totalTime) {
            return responseData(res, "", 400, false, "Total time is required")
        }
        else if (!current) {
            return responseData(res, "", 400, false, "Current time is required")
        }
        // else if (!sub_task_assignee) {
        //     responseData(res, "", 400, false, "Sub task assignee is required")
        // }

        else {
            const check_task = await leadTaskModel.findOne({ task_id: task_id, lead_id: lead_id })
            if (!check_task) {
                return responseData(res, "", 400, false, "Task not found")
            }
            else {
                if (check_task.task_status === 'Compeleted' || check_task.task_status === 'Cancelled') {
                    return responseData(res, "", 400, false, "Task is already completed or cancelled")
                }
                else {
                    const check_subtask = check_task.subtasks.find((item) => item.sub_task_id === sub_task_id)
                    if (!check_subtask) {

                        return responseData(res, "", 400, false, "Sub task not found")

                    }
                    else {

                        if (check_subtask.sub_task_status === 'Completed' || check_subtask.sub_task_status === 'Cancelled') {
                            await leadTimerModel.findOneAndUpdate({
                                task_id: task_id,
                                lead_id: lead_id,
                                'subtaskstime.sub_task_id': sub_task_id
                            },
                                {
                                    $set: {
                                        'subtaskstime.$.sub_task_isrunning': false,

                                    }
                                },
                                { new: true, useFindAndModify: false }
                            )
                            return responseData(res, "", 400, false, "Sub task is already completed or cancelled")
                        }
                        else if (sub_task_assignee && check_subtask.sub_task_assignee !== sub_task_assignee) {
                            return responseData(res, "", 400, false, "Sub task assignee is not valid")
                        }
                        else {
                            const update_timer = await leadTimerModel.findOneAndUpdate({
                                task_id: task_id,
                                lead_id: lead_id,
                                'subtaskstime.sub_task_id': sub_task_id
                            },
                                {
                                    $set: {
                                        'subtaskstime.$.sub_task_time': time,
                                        'subtaskstime.$.sub_task_isrunning': isrunning,

                                        'subtaskstime.$.sub_task_totalTime': totalTime,
                                        'subtaskstime.$.sub_task_current': current


                                    }
                                },
                                { new: true, useFindAndModify: false }
                            )

                            if (update_timer) {
                                return responseData(res, "Timer updated successfully", 200, true, "")
                            }
                            else {
                                return responseData(res, "", 400, false, "Timer not updated")
                            }
                        }
                    }
                }

            }
        }
    }
    catch (err) {
        console.log(err)
        responseData(res, "", 500, false, "Internal Server Error", err)
    }

}

export const GetSingleLeadSubtimerController = async (req, res) => {
    try {
        const { lead_id, task_id, sub_task_id } = req.query;

        // Validate required fields in a single step
        if (!lead_id || !task_id || !sub_task_id) {
            const missingField = !lead_id ? "Lead id" : !task_id ? "Task id" : "Sub task id";
            return responseData(res, "", 400, false, `${missingField} is required`);
        }

        // Combine both checks into a single database query using aggregation for better performance
        const taskWithSubtask = await leadTimerModel.aggregate([
            {
                $match: {
                    lead_id,
                    task_id,
                    'subtaskstime.sub_task_id': sub_task_id
                }
            },
            {
                $project: {
                    subtask: {
                        $filter: {
                            input: '$subtaskstime',
                            as: 'subtask',
                            cond: { $eq: ['$$subtask.sub_task_id', sub_task_id] }
                        }
                    }
                }
            }
        ]);

        // If task or subtask is not found, return an error
        if (!taskWithSubtask.length || !taskWithSubtask[0].subtask.length) {
            return responseData(res, "", 400, false, "Task or Sub task not found");
        }

        // Prepare the response data
        const subtask = taskWithSubtask[0].subtask[0];
        const response = {
            time: subtask.sub_task_time,
            isrunning: subtask.sub_task_isrunning,
            total_time: subtask.sub_task_totalTime,
            current: subtask.sub_task_current,
        };

        return responseData(res, "Sub task timer found", 200, true, "", response);
    } catch (err) {
        console.error(err);
        return responseData(res, "", 500, false, "Internal Server Error", err);
    }
};


export const UpdateLeadTasktimerController = async (req, res) => {
    try {
        const time = req.body.time;
        const isrunning = req.body.isrunning;
        const totalTime = req.body.total_time;
        const current = req.body.current;
        const lead_id = req.body.lead_id;
        const task_id = req.body.task_id;
        const sub_task_id = req.body.sub_task_id;
        const sub_task_assignee = req.body.sub_task_assignee;
        const task_assignee = req.body.task_assignee;

        if (!time) {
            return responseData(res, "", 400, false, "Time is required")
        }
        else if (!lead_id) {
            return responseData(res, "", 400, false, "Lead id is required")
        }
        else if (!task_id) {
            return responseData(res, "", 400, false, "Task id is required")
        }
        // else if (!sub_task_id) {
        //     return responseData(res, "", 400, false, "Sub task id is required")
        // }

        else if (!totalTime) {
            return responseData(res, "", 400, false, "Total time is required")
        }
        else if (!current) {
            return responseData(res, "", 400, false, "Current time is required")
        }
        // else if (!sub_task_assignee) {
        //     responseData(res, "", 400, false, "Sub task assignee is required")
        // }

        else {
            const check_task = await leadTaskModel.findOne({ task_id: task_id, lead_id: lead_id })
            if (!check_task) {
                return responseData(res, "", 400, false, "Task not found")
            }
            else {
                if (check_task.task_status === 'Compeleted' || check_task.task_status === 'Cancelled') {
                    return responseData(res, "", 400, false, "Task is already completed or cancelled")
                }
                else {
                    

                        if (check_task.task_status === 'Completed' || check_task.task_status === 'Cancelled') {
                            await leadTimerModel.findOneAndUpdate({
                                task_id: task_id,
                                lead_id: lead_id,
                                'taskstime.task_id': task_id
                            },
                                {
                                    $set: {
                                        'taskstime.$.task_isrunning': false,

                                    }
                                },
                                { new: true, useFindAndModify: false }
                            )
                            return responseData(res, "", 400, false, "Task is already completed or cancelled")
                        }
                        else if (task_assignee && check_task.task_assignee !== task_assignee) {
                            return responseData(res, "", 400, false, "Task assignee is not valid")
                        }
                        else {
                            const update_timer = await leadTimerModel.findOneAndUpdate({
                                task_id: task_id,
                                lead_id: lead_id,
                                'taskstime.task_id': task_id
                            },
                                {
                                    $set: {
                                        'taskstime.$.task_time': time,
                                        'taskstime.$.task_isrunning': isrunning,

                                        'taskstime.$.task_totalTime': totalTime,
                                        'taskstime.$.task_current': current


                                    }
                                },
                                { new: true, useFindAndModify: false }
                            )

                            if (update_timer) {
                                return responseData(res, "Timer updated successfully", 200, true, "")
                            }
                            else {
                                return responseData(res, "", 400, false, "Timer not updated")
                            }
                        }
                    
                }

            }
        }
    }
    catch (err) {
        console.log(err)
        responseData(res, "", 500, false, "Internal Server Error", err)
    }

}

export const GetSingleLeadTasktimerController = async (req, res) => {
    try {
        const { lead_id, task_id, sub_task_id } = req.query;

        // Validate required fields in a single step
        if (!lead_id || !task_id) {
            const missingField = !lead_id ? "Lead id" : !task_id ? "Task id" : "Sub task id";
            return responseData(res, "", 400, false, `${missingField} is required`);
        }

        // Combine both checks into a single database query using aggregation for better performance
        const taskWithtask = await leadTimerModel.aggregate([
            {
                $match: {
                    lead_id,
                    task_id,
                    'taskstime.task_id': task_id
                }
            },
            {
                $project: {
                    task: {
                        $filter: {
                            input: '$taskstime',
                            as: 'task',
                            cond: { $eq: ['$$task.task_id', task_id] }
                        }
                    }
                }
            }
        ]);

        // If task or subtask is not found, return an error
        if (!taskWithtask.length || !taskWithtask[0].task.length) {
            return responseData(res, "", 400, false, "Task or task not found");
        }

        // Prepare the response data
        const task = taskWithtask[0].task[0];
        const response = {
            time: task.task_time,
            isrunning: task.task_isrunning,
            total_time: task.task_totalTime,
            current: task.task_current,
        };

        return responseData(res, "task timer found", 200, true, "", response);
    } catch (err) {
        console.error(err);
        return responseData(res, "", 500, false, "Internal Server Error", err);
    }
};




export const UpdateLeadMinitimerController = async (req, res) => {
    try {
        const time = req.body.time;
        const isrunning = req.body.isrunning;
        const totalTime = req.body.total_time;
        const current = req.body.current;
        const lead_id = req.body.lead_id;
        const task_id = req.body.task_id;
        const mini_task_id = req.body.mini_task_id;
        const mini_task_assignee = req.body.mini_task_assignee;

        if (!time) {
            return responseData(res, "", 400, false, "Time is required")
        }
        else if (!lead_id) {
            return responseData(res, "", 400, false, "Lead id is required")
        }
        else if (!task_id) {
            return responseData(res, "", 400, false, "Task id is required")
        }
        else if (!mini_task_id) {
            return responseData(res, "", 400, false, "Mini task id is required")
        }

        else if (!totalTime) {
            return responseData(res, "", 400, false, "Total time is required")
        }
        else if (!current) {
            return responseData(res, "", 400, false, "Current time is required")
        }
        // else if (!sub_task_assignee) {
        //     responseData(res, "", 400, false, "Sub task assignee is required")
        // }

        else {
            const check_task = await leadTaskModel.findOne({ task_id: task_id, lead_id: lead_id })
            if (!check_task) {
                return responseData(res, "", 400, false, "Task not found")
            }
            else {
                if (check_task.task_status === 'Compeleted' || check_task.task_status === 'Cancelled') {
                    return responseData(res, "", 400, false, "Task is already completed or cancelled")
                }
                else {
                    const check_minitask = check_task.minitasks.find((item) => item.mini_task_id === mini_task_id)
                    if (!check_minitask) {

                        return responseData(res, "", 400, false, "Mini task not found")

                    }
                    else {

                        if (check_minitask.mini_task_status === 'Completed' || check_minitask.mini_task_status === 'Cancelled') {
                            await leadTimerModel.findOneAndUpdate({
                                task_id: task_id,
                                lead_id: lead_id,
                                'minitaskstime.mini_task_id': mini_task_id
                            },
                                {
                                    $set: {
                                        'minitaskstime.$.mini_task_isrunning': false,

                                    }
                                },
                                { new: true, useFindAndModify: false }
                            )
                            return responseData(res, "", 400, false, "Mini task is already completed or cancelled")
                        }
                        else if (mini_task_assignee && check_minitask.mini_task_assignee !== mini_task_assignee) {
                            return responseData(res, "", 400, false, "Mini task assignee is not valid")
                        }
                        else {
                            const update_timer = await leadTimerModel.findOneAndUpdate({
                                task_id: task_id,
                                lead_id: lead_id,
                                'minitaskstime.mini_task_id': mini_task_id
                            },
                                {
                                    $set: {
                                        'minitaskstime.$.mini_task_time': time,
                                        'minitaskstime.$.mini_task_isrunning': isrunning,

                                        'minitaskstime.$.mini_task_totalTime': totalTime,
                                        'minitaskstime.$.mini_task_current': current


                                    }
                                },
                                { new: true, useFindAndModify: false }
                            )

                            if (update_timer) {
                                return responseData(res, "Timer updated successfully", 200, true, "")
                            }
                            else {
                                return responseData(res, "", 400, false, "Timer not updated")
                            }
                        }
                    }
                }

            }
        }
    }
    catch (err) {
        console.log(err)
        responseData(res, "", 500, false, "Internal Server Error", err)
    }

}

export const GetSingleLeadMinitimerController = async (req, res) => {
    try {
        const { lead_id, task_id, mini_task_id } = req.query;

        // Validate required fields in a single step
        if (!lead_id || !task_id || !mini_task_id) {
            const missingField = !lead_id ? "Lead id" : !task_id ? "Task id" : "Mini task id";
            return responseData(res, "", 400, false, `${missingField} is required`);
        }

        // Combine both checks into a single database query using aggregation for better performance
        const taskWithMinitask = await leadTimerModel.aggregate([
            {
                $match: {
                    lead_id,
                    task_id,
                    'minitaskstime.mini_task_id': mini_task_id
                }
            },
            {
                $project: {
                    minitask: {
                        $filter: {
                            input: '$minitaskstime',
                            as: 'minitask',
                            cond: { $eq: ['$$minitask.mini_task_id', mini_task_id] }
                        }
                    }
                }
            }
        ]);

        // If task or minitask is not found, return an error
        if (!taskWithMinitask.length || !taskWithMinitask[0].minitask.length) {
            return responseData(res, "", 400, false, "Task or Mini task not found");
        }

        // Prepare the response data
        const minitask = taskWithMinitask[0].minitask[0];
        const response = {
            time: minitask.mini_task_time,
            isrunning: minitask.mini_task_isrunning,
            total_time: minitask.mini_task_totalTime,
            current: minitask.mini_task_current,
        };

        return responseData(res, "Mini task timer found", 200, true, "", response);
    } catch (err) {
        console.error(err);
        return responseData(res, "", 500, false, "Internal Server Error", err);
    }
};