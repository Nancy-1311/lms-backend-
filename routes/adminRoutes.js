import express from "express";
import {
  getUsers,
  deleteUser,
  toggleUserStatus,
  changeUserRole,
} from "../controllers/adminController.js";

import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔒 Protected routes
router.get("/users", protect, authorize("admin"), getUsers);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

// 🔥 NEW ROUTES
router.put("/users/:id/toggle", protect, authorize("admin"), toggleUserStatus);
router.put("/users/:id/role", protect, authorize("admin"), changeUserRole);

export default router;