import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
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

    tutorName: String,
    subject: String,

    date: {
      type: Date,
      required: true, // ✅ ADDED
    },

    time: {
      type: String,
      required: true, // ✅ ADDED
    },

    // ✅ SINGLE PRICE FIELD (CORRECT)
    price: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      default: "pending",
    },

    // ✅ MAIN FLAG (CRITICAL)
    isPaid: {
      type: Boolean,
      default: false,
    },

    recordingUrl: {
      type: String,
      default: "",
    },

    reviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Booking", bookingSchema);