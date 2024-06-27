import { responseData } from "../../../utils/respounse.js";
import projectModel from "../../../models/adminModels/project.model.js";
import taskModel from "../../../models/adminModels/task.model.js";
import registerModel from "../../../models/usersModels/register.model.js";


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

        const check_user = await registerModel.findById({ _id: user_id })
        if (!check_user) {
            responseData(res, "", 404, false, "User not found", [])
        }
        const check_project = await projectModel.findOne({ project_id: project_id })
        if (!check_project) {
            responseData(res, "", 404, false, "Project not found", [])
        }

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
        responseData(res, "", 200, true, "Task created successfully", [])

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

        const check_user = await registerModel.findById({ _id: user_id })
        if (!check_user) {
            responseData(res, "", 404, false, "User not found", [])
        }

        const check_project = await projectModel.findOne({ project_id: project_id })
        if (!check_project) {
            responseData(res, "", 404, false, "Project not found", [])
        }
        const tasks = await taskModel.find({ project_id: project_id })

        responseData(res, "", 200, true, "Tasks found successfully", tasks)
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

        const check_project = await projectModel.findOne({ project_id: project_id })
        if (!check_project) {
            responseData(res, "", 404, false, "Project not found", [])
        }

        const check_task = await taskModel.findOne({ task_id: task_id })
        if (!check_task) {
            responseData(res, "", 404, false, "Task not found", [])
        }

        responseData(res, "", 200, true, "Task found successfully", check_task)


    }
    catch (err) {
        res.send(err);
        console.log(err);
    }
}