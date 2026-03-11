import express from "express";
import {
  getPayoutsList,
  approvePayout,
  bulkProcessPayouts,
} from "../controllers/payoutController.js";

const router = express.Router();

router.get("/payouts", getPayoutsList);
router.patch("/payouts/:id/approve", approvePayout);
router.post("/payouts/bulk-process", bulkProcessPayouts);

export default router;
