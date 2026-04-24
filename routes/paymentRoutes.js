import express from "express";
import {
  createCheckoutSession,
  getTutorEarnings,
  confirmPayment,
  getMyPayments,
} from "../controllers/paymentController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);


router.post("/confirm", protect, confirmPayment);
router.get("/my-payments", protect, getMyPayments);

router.get(
  "/earnings",
  protect,
  authorize("tutor"),
  getTutorEarnings
);

export default router;