import mongoose from "mongoose";


const SubtaskSchema = new mongoose.Schema({
    sub_task_id: { type: String, required: true },
    org_id: { type: String, required: true },
    sub_task_name: { type: String, required: true },
    sub_task_end_date: { type: String, required: true },
    sub_task_start_date: { type: String, required: true },
    sub_task_details:[] 
    
});


const project_execution_Schema = new mongoose.Schema({
  project_id: {
    type: String,
    required: true,
  },
  org_id:{
    type: String,
    require:true,
  },
  task_name:{
    type: String,
    required: true,
  },
  task_id:{
    type:String,
    required:true,  
  },
  start_date:{
    type:String,
    required:true,
  },
  end_date:{
    type:String,
    required:true,
  },
  task_details:[],
    subtasks: [SubtaskSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export default mongoose.model("project_execution", project_execution_Schema, "project_execution");
