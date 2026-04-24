import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    tutorName: String,

    amount: {
      type: Number,
      required: true,
    },

    // STRIPE DATA
    transactionId: {
      type: String, 
    },

    stripeSessionId: {
      type: String, 
    },

    paymentMethod: {
      type: String,
      default: "card",
    },

    status: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "pending",
    },

    // TIMESTAMPS
    paidAt: {
      type: Date,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);