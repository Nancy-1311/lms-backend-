import express from "express";
import {
  createBooking,
  getBookings,
  addRecording,
  deleteBooking,
  rescheduleBooking,
  getRecording,
} from "../controllers/bookingController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// PROTECTED ROUTES

// CREATE BOOKING
router.post("/", protect, createBooking);

// GET BOOKINGS (student + tutor handled inside controller)
router.get("/", protect, getBookings);

// RECORDING
router.put("/:id/recording", protect, addRecording);
router.get("/:id/recording", protect, getRecording);

// CANCEL BOOKING
router.delete("/:id", protect, deleteBooking);

// RESCHEDULE BOOKING
router.put("/:id/reschedule", protect, rescheduleBooking);

export default router;