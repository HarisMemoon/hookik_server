// src/controllers/auth.controller.js
import authService from "../services/auth.service.js";
import jwt from "jsonwebtoken";

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const result = await authService.loginService(email, password);

    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }

    const user = result.user;

    // ✅ Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    // ✅ Send token
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default { login };
