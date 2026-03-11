import express from "express";
import {
  createAdminUser,
  getAdminUsers,
  deleteAdminUser,
  updateAdminUser,
} from "../controllers/adminUserController.js";

const router = express.Router();

router.get("/admin-users", getAdminUsers);
router.post("/admin-users", createAdminUser);
router.put("/admin-users/:id", updateAdminUser);
router.delete("/admin-users/:id", deleteAdminUser);

export default router;
