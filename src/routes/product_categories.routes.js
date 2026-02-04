import express from "express";
import { getCategoriesList } from "../controllers/categoryController.js";

const router = express.Router();

router.get("/categories", getCategoriesList);

export default router;
