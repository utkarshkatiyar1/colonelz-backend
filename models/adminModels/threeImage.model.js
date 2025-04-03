import mongoose from "mongoose";

const threeimageSchema = new mongoose.Schema({
  org_id: {
    type: String,
    required: true,
  },
  lead_id: {
    type: String,
  },
  project_id: {
    type: String,
  },
  user_id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  main_img_id: {
    type: String,
  },
  img_id: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: null,
  },
  url: {
    type: String,
    default: null,
  },
  crd: {
    type: [],
  },
  hp: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("threeimage", threeimageSchema, "threeimage");
