import express from "express";
import {
  createReview,
  getReviewsByTutor,
  getMyReviews, 
} from "../controllers/reviewController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE REVIEW
router.post("/", protect, createReview);

// GET REVIEWS OF A TUTOR
router.get("/:tutorId", getReviewsByTutor);

// GET REVIEWS OF LOGGED-IN USER ONLY
router.get("/my", protect, getMyReviews);

export default router;