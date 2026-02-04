import express from "express";
import { getPayoutsList } from "../controllers/payoutController.js";

const router = express.Router();

router.get("/payouts", getPayoutsList);

export default router;
