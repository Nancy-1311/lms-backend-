import express from "express";
import {
  createBooking,
  getBookings,
  addRecording,
  deleteBooking,
  rescheduleBooking,
  getRecording,
  addMeetingLink,
  getMyPayments,
  adminCancelBooking,
  adminMarkCompleted,
} from "../controllers/bookingController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("Booking API Working ✅");
});

// CREATE BOOKING
router.post("/", protect, createBooking);

// GET BOOKINGS
router.get("/", protect, getBookings);

// ADMIN ACTIONS
router.delete("/admin/:id", protect, adminCancelBooking);
router.put("/admin/:id/complete", protect, adminMarkCompleted);

// RECORDING
router.put("/:id/recording", protect, addRecording);
router.get("/:id/recording", protect, getRecording);

// CANCEL BOOKING
router.delete("/:id", protect, deleteBooking);

// RESCHEDULE BOOKING
router.put("/:id/reschedule", protect, rescheduleBooking);

// MEETING LINK
router.put("/:id/meeting-link", protect, addMeetingLink);

// PAYMENTS
router.get("/my-payments", protect, getMyPayments);

export default router;