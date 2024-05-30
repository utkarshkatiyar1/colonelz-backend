import mongoose from 'mongoose';

const archiveSchema = new mongoose.Schema({
    lead_id: { type: String },
    project_id: { type: String },
    folder_name: { type: String },
    sub_folder_name_second: { type: String },
    files: [],
    type: { type: String },
    archivedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Archive', archiveSchema);


