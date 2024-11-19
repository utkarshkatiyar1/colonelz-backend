import mongoose from "mongoose";

const SubtasktimeSchema = new mongoose.Schema({
    sub_task_id: { type: String, required: true },
    sub_task_name: { type: String, required: true },
    sub_task_assignee: {
        type: String,
        required: true,
    },

    sub_task_time: { type: String, required: true },
    sub_task_isrunning: { type: Boolean, required: true },
    sub_task_totalTime: { type: String, required: true },
    sub_task_current: { type: String, required: true },
});

const taskWorkSchema = new mongoose.Schema({
    project_id: {
        type: String,
        required: true,
    },
    task_id: {
        type: String,
        required: true,
    },
    task_name: {
        type: String,
        required: true,
    },
    task_time: {
        type: String,

    },
    org_id: 
    { type: String,
     required: true 
    },
    task_assignee: {
        type: String,
        required: true,
    },
    subtaskstime: [SubtasktimeSchema],

    createdAt: {
        type: Date,
        default: Date.now,
    },
});
export default mongoose.model("taskWork", taskWorkSchema, "taskWork");
