import express from "express";
import { getDashboardData } from "../controllers/dashboardController.js";

const router = express.Router();

// Single endpoint for all dashboard data
router.get("/", getDashboardData);

export default router;
