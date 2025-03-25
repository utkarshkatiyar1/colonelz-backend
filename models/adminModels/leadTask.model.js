import mongoose from "mongoose";


const LeadSubtaskSchema = new mongoose.Schema({
    sub_task_id: { type: String, required: true },
    org_id: { type: String, required: true },
    sub_task_name: { type: String, required: true },
    sub_task_assignee: { type: String},
    sub_task_status: { type: String, required: true },
    estimated_sub_task_start_date: { type: String, required: true },
    estimated_sub_task_end_date: { type: String, required: true },
    actual_sub_task_start_date: { type: String,},
    actual_sub_task_end_date: { type: String,  },
    sub_task_priority: { type: String, required: true },
    sub_task_description: { type: String},
    sub_task_createdBy: { type: String, required: true },
    sub_task_createdOn: { type: Date },
    sub_task_reporter: { type: String},
    sub_task_updatedBy: [],
    remark:[]
});

const LeadTaskSchema = new mongoose.Schema({
    lead_id: { type: String, required: true },
    task_id: { type: String, required: true },
    org_id: { type: String, required: true },
    task_name: { type: String, required: true },
    task_assignee: { type: String },
    task_status: { type: String, required: true },
    // estimated_task_start_date: { type: String,  },
    estimated_task_end_date: { type: String, },
    // actual_task_start_date: { type: String, },
    // actual_task_end_date: { type: String, },
    task_description: { type: String },
    task_priority: { type: String, required: true },
    task_createdBy: { type: String, required: true },
    task_createdOn: { type: Date, required: true },
    reporter: { type: String},
    task_updatedBy: [],
    subtasks: [LeadSubtaskSchema]

});

export default mongoose.model("leadTask", LeadTaskSchema, "leadTask");
