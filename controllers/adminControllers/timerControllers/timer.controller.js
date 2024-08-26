import { responseData } from "../../../utils/respounse.js";

import taskModel from "../../../models/adminModels/task.model.js";
import timerModel from "../../../models/adminModels/timer.Model.js";

export const UpdateSubtimerController = async (req, res) => {
    try {
        const time = req.body.time;
        const isrunning = req.body.isrunning;
        const totalTime = req.body.total_time;
        const current = req.body.current;
        const project_id = req.body.project_id;
        const task_id = req.body.task_id;
        const sub_task_id = req.body.sub_task_id;
        const sub_task_assignee = req.body.sub_task_assignee;

        if (!time) {
            return responseData(res, "", 400, false, "Time is required")
        }
        else if (!project_id) {
            return responseData(res, "", 400, false, "Project id is required")
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
        else if (!sub_task_assignee) {
            sub_dataResponse(res, "", 400, false, "Sub task assignee is required")
        }

        else {
            const check_task = await taskModel.findOne({ task_id: task_id, project_id: project_id })
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
                            await timerModel.findOneAndUpdate({
                                task_id: task_id,
                                project_id: project_id,
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
                        else if (check_subtask.sub_task_assignee !== sub_task_assignee) {
                            return responseData(res, "", 400, false, "Sub task assignee is not valid")
                        }
                        else {
                            const update_timer = await timerModel.findOneAndUpdate({
                                task_id: task_id,
                                project_id: project_id,
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

export const GetSingleSubtimerController = async (req, res) => {
    try {
        const { project_id, task_id, sub_task_id } = req.query;

        // Validate required fields
        if (!project_id || !task_id || !sub_task_id) {
            const missingField = !project_id ? "Project id" : !task_id ? "Task id" : "Sub task id";
            return responseData(res, "", 400, false, `${missingField} is required`);
        }

        // Check if task exists
        const check_task = await taskModel.findOne({ task_id, project_id });
        if (!check_task) {
            return responseData(res, "", 400, false, "Task not found");
        }

        // Check if subtask exists in timer model
        const check_subtask = await timerModel.findOne({ task_id, project_id, 'subtaskstime.sub_task_id': sub_task_id });
        if (!check_subtask) {
            return responseData(res, "", 400, false, "Sub task not found");
        }

        // Find the specific subtask timer
        const subtask = check_subtask.subtaskstime.find(item => item.sub_task_id === sub_task_id);
        if (!subtask) {
            return responseData(res, "", 400, false, "Sub task not found");
        }

        // Prepare the response
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



