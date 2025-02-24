import mongoose from "mongoose";

const files = new mongoose.Schema({
    file_id: { type: String, required: true },
    file_name: { type: String, required: true },
    file_url: { type: String, required: true },
    status: {type: String},
    users: [],
});

const approvalSchema = new mongoose.Schema({
    lead_id: {
        type: String,
        required: true,
    },
    org_id: 
    { type: String,
     required: true 
    },

    files: [files],

    createdAt: {
        type: Date,
        default: Date.now,
    },
});
export default mongoose.model("approval", approvalSchema, "approval");
