import express from "express";
import {
  getProductsList,
  updateProduct,
} from "../controllers/productsController.js";
import upload from "../middleware/upload.js";

const router = express.Router();
router.get("/products", getProductsList);
router.put("/products/:id", upload.single("image_file"), updateProduct);

export default router;
