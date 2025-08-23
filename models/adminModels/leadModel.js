import mongoose from "mongoose";

// const contractSchema = new mongoose.Schema({
//   admin_status: String,
//   itemId: String,
//   file_name: String,
//   files: [],
//   remark: String,

// });

const contractSchema = new mongoose.Schema({
  admin_status: { type: String, default: "notsend" },
  itemId: { type: String, required: true },
  file_name: { type: String },
  files: [{ type: String }], // array of file URLs
  remark: { type: String, default: "" },

  // ✅ Contract details
  project_type: { type: String },
  project_name: { type: String },
  // createdAt: { type: Date },
});

const lead = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lead_id: {
    type: String,
    required: true,
  },
  org_id: {
    type: String,
    require: true,
  },
  lead_details: [],
  lead_manager: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    require: true,
  },
  source: {
    type: String,
    // You can define specific sources based on your needs
  },
  contract: [contractSchema],
  date: {
    type: String,
    require: true,
  },
  updated_date: {
    type: String,
    require: true,
  },
  notes: [
    {
      content: {
        type: String,
      },
      createdBy: {
        type: String,
      },
      date: {
        type: String,
      },
      status: {
        type: String,
      },
    },
  ],
  lead_update_track: [],
  lead_status: {
    type: String,
  },
  contract_Status: {
    type: Boolean,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Lead", lead, "Lead");
