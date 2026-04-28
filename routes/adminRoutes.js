import express from "express";
import {
  getUsers,
  deleteUser,
  toggleUserStatus,
  changeUserRole,
  getAdminDashboard,
  getAdminAnalytics,
  getAdminBookings,
  approveTutor,
  rejectTutor,
  getTopTutors,
  getAdminReviews,
  deleteReviewAdmin,
  createUserByAdmin,
} from "../controllers/adminController.js";

import {
  adminCancelBooking,
  adminMarkCompleted,
} from "../controllers/bookingController.js";

import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// APPLY MIDDLEWARE ONCE 
router.use(protect, authorize("admin"));

// ================= USERS =================
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/toggle", toggleUserStatus);
router.put("/users/:id/role", changeUserRole);
router.get("/top-tutors", getTopTutors);
router.get("/reviews", getAdminReviews);
router.delete("/reviews/:id", deleteReviewAdmin);
router.post("/users", protect, createUserByAdmin);
// ================= DASHBOARD =================
router.get("/dashboard", getAdminDashboard);
router.get("/analytics", getAdminAnalytics);

// ================= BOOKINGS =================
router.get("/bookings", getAdminBookings);

// NEW ADMIN BOOKING ACTIONS
router.delete("/bookings/:id", adminCancelBooking);
router.put("/bookings/:id/complete", adminMarkCompleted);

router.put("/tutors/:id/approve", approveTutor);
router.put("/tutors/:id/reject", rejectTutor);

export default router;
