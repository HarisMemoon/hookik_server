import express from "express";
import { getOrdersList } from "../controllers/ordersController.js";

const router = express.Router();
router.get("/orders", getOrdersList);

export default router;
