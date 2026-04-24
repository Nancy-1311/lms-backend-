import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // STUDENT
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // TUTOR
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },

    tutorName: {
      type: String,
      trim: true,
    },

    subject: {
      type: String,
      trim: true,
    },

    // DATE + TIME
    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
      trim: true,
    },

    // PRICE
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // STATUS
    isCompleted: {
      type: Boolean,
      default: false,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    // PAYMENT LINK
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },

    // SESSION DATA
    recordingUrl: {
      type: String,
      default: "",
    },

    meetingLink: {
      type: String,
      default: "",
    },

    //  REVIEW FLAG
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

