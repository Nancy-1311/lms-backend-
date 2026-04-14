import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // ✅ ADDED
  },

  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
    required: true, // ✅ ADDED
  },

  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true, // 🔥 CRITICAL FIX
  },

  tutorName: String,

  amount: {
    type: Number,
    required: true, // ✅ ADDED
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Payment", paymentSchema);