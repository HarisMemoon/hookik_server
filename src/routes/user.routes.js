import express from "express";
import {
  getUsersList,
  updateUserStatus,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// GET /api/admin/users
router.get("/users", getUsersList);

// PUT /api/admin/users/:id/status
router.put("/users/:id/status", updateUserStatus);

// DELETE /api/admin/users/:id
router.delete("/users/:id", deleteUser);

export default router;
