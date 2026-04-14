import express from "express";
import {
  createCheckoutSession,
  getTutorEarnings,
  confirmPayment,
  getMyPayments,
} from "../controllers/paymentController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// 💳 PAYMENT

// 🔥 FIX: route name MUST match frontend
router.post("/create-checkout-session", createCheckoutSession);

// 🔥 CONFIRM PAYMENT (VERY IMPORTANT)
router.post("/confirm", protect, confirmPayment);
router.get("/my-payments", protect, getMyPayments);
// 💰 EARNINGS (TUTOR ONLY)
router.get(
  "/earnings",
  protect,
  authorize("tutor"),
  getTutorEarnings
);

export default router;