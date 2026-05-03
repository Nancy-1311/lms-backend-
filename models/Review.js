import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: Number,
  comment: String,
});

bookingId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Booking",
  required: true,
},

export default mongoose.model("Review", reviewSchema);
