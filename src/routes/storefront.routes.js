import express from "express";
import { getStorefrontsList } from "../controllers/storefrontController.js";

const router = express.Router();

/**
 * @route   GET /api/admin/storefronts
 * @desc    Get all storefronts with filters and search
 * @access  Protected (Admin Only)
 */
router.get("/storefronts", getStorefrontsList);

export default router;
