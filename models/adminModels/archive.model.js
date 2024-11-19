import mongoose from 'mongoose';

const archiveSchema = new mongoose.Schema({
    lead_id: { type: String },
    org_id:{type: String},
    project_id: { type: String },
    lead_name: { type: String },
    project_name: { type: String },
    folder_name: { type: String },
    sub_folder_name_first: { type: String },
    sub_folder_name_second: { type: String },
    files: [],
    type: { type: String },
    deleted_type: {type: String},
    archivedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Archive', archiveSchema);


