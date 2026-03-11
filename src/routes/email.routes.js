import express from "express";

const router = express.Router();

import sendEmail from "../controllers/emailController.js";

router.post("/send-email", sendEmail);

export default router;
