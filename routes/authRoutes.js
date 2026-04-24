import express from "express";
import {
  register,
  login,
  getMe,
  updateMe,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";
import { changePassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// PROFILE ROUTES
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/change-password", protect, changePassword);
export default router;  