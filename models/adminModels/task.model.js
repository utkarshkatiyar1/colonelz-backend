import mongoose from "mongoose";


const SubtaskSchema = new mongoose.Schema({
    sub_task_id: { type: String, required: true },
    sub_task_name: { type: String, required: true },
    sub_task_assignee: { type: String, required: true },
    sub_task_status: { type: String, required: true },
    estimated_sub_task_start_date: { type: String, required: true },
    estimated_sub_task_end_date: { type: String, required: true },
    actual_sub_task_start_date: { type: String,},
    actual_sub_task_end_date: { type: String,  },
    sub_task_priority: { type: String, required: true },
    sub_task_description: { type: String},
    sub_task_createdBy: { type: String, required: true },
    sub_task_createdOn: { type: Date },
    sub_task_reporter: { type: String, required: true },
    sub_task_updatedBy: [],
    remark:[]
});

const TaskSchema = new mongoose.Schema({
    project_id: { type: String, required: true },
    task_id: { type: String, required: true },
    task_name: { type: String, required: true },
    task_assignee: { type: String, required: true },
    task_status: { type: String, required: true },
    estimated_task_start_date: { type: String, required: true },
    estimated_task_end_date: { type: String, required: true },
    actual_task_start_date: { type: String, },
    actual_task_end_date: { type: String, },
    task_description: { type: String },
    task_priority: { type: String, required: true },
    task_createdBy: { type: String, required: true },
    task_createdOn: { type: Date, required: true },
    reporter: { type: String, required: true },
    task_updatedBy: [],
    subtasks: [SubtaskSchema]

});

export default mongoose.model("task", TaskSchema, "task");
