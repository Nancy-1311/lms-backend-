import express from "express";
import {
  createReview,
  getReviewsByTutor,
  getMyReviews, 
} from "../controllers/reviewController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/", protect, createReview);


router.get("/:tutorId", getReviewsByTutor);

router.get("/my", protect, getMyReviews);

export default router;