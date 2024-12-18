import mongoose from "mongoose";

const orgusermapSchema = new mongoose.Schema({


    org_id: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
export default mongoose.model("orgusermap", orgusermapSchema, "orgusermap");
