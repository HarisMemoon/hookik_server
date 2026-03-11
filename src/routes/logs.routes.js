import express from "express";
import { getActionLogs } from "../controllers/logController.js";

const router = express.Router();
router.get("/logs", getActionLogs);

export default router;
