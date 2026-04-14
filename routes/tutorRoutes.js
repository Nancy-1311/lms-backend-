import express from "express";
import {
  getTutors,
  createTutor,
  getMyTutorProfile,
  updateMyTutorProfile,
  deleteMyTutorProfile,
  getTutorDashboard,
  updateTutorPrice,
} from "../controllers/tutorController.js";

// ✅ ADD THIS IMPORT
import { getTutorEarnings } from "../controllers/paymentController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// PUBLIC
router.get("/", getTutors);

// ✅ EARNINGS ROUTE (NOW WORKS)
router.get("/earnings", protect, authorize("tutor"), getTutorEarnings);

// TUTOR DASHBOARD
router.get(
  "/dashboard",
  protect,
  authorize("tutor"),
  getTutorDashboard
);

// PROFILE
router.get("/me", protect, authorize("tutor"), getMyTutorProfile);
router.put("/me", protect, authorize("tutor"), updateMyTutorProfile);

// 🔥 OPTIONAL CLEAN FIX
router.delete("/:id", protect, authorize("admin"), deleteMyTutorProfile);

router.put("/admin/:id", protect, authorize("admin"), updateTutorPrice);

// CREATE
router.post("/", protect, authorize("tutor"), createTutor);

export default router;