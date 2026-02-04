import express from "express";
import {
  getStorefrontsList,
  updateStorefront,
} from "../controllers/storefrontController.js";

const router = express.Router();

/**
 * @route   GET /api/admin/storefronts
 * @desc    Get all storefronts with filters and search
 * @access  Protected (Admin Only)
 */
router.get("/storefronts", getStorefrontsList);
router.put("/storefronts/:id", updateStorefront);

export default router;
