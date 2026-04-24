import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,

  role: {
    type: String,
    enum: ["student", "tutor", "admin"],
    default: "student",
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  profilePic: {
    type: String,
    default: "",
  },
});

export default mongoose.model("User", userSchema);