import mongoose from "mongoose";

const tutorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  name: String,
  subject: String,
  rating: Number,

  price: {
    type: Number,
    required: true,
    default: 500,
  },

  bio: String,
  experience: String,
  expertise: String,

  availability: [String],

  // 🔥 ADD THIS
  isActive: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("Tutor", tutorSchema);