import express from "express";
import { getStats } from "../controllers/StatsController.js";

const router = express.Router();

router.get("/stats", getStats);

export default router;
