import express from "express";
import {
  getProductsList,
  updateProduct,
} from "../controllers/productsController.js";

const router = express.Router();
router.get("/products", getProductsList);
router.put("/products/:id", updateProduct);

export default router;
