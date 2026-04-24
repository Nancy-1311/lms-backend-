import express from "express";
import {
  savePayment,
  getPayments,
} from "../controllers/paymentHistoryController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// PROTECTED
router.post("/", protect, savePayment);
router.get("/", protect, getPayments);

export default router;