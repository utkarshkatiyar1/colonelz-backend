import mongoose from "mongoose";

const signUp = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
  organization: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    require: true,
  },
  userProfile: {
    type: String,
    // required:true,
  },
  data: [],
  access: {},
  refreshToken: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export default mongoose.model("users", signUp, "users");
