import express from "express";
import {
  getUsersList,
  updateUserStatus,
  deleteUser,
  createUserByAdmin,
  updateUserByAdmin,
} from "../controllers/userController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// POST /api/admin/users
router.post("/users", upload.single("profile_picture"), createUserByAdmin);

// GET /api/admin/users
router.get("/users", getUsersList);

router.put("/users/:id", upload.single("profile_picture"), updateUserByAdmin);

// PUT /api/admin/users/:id/status
router.put("/users/:id/status", updateUserStatus);

// DELETE /api/admin/users/:id
router.delete("/users/:id", deleteUser);

export default router;
