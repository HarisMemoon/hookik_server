import express from "express";
import { getProductsList } from "../controllers/productsController.js";

const router = express.Router();
router.get("/products", getProductsList);

export default router;
