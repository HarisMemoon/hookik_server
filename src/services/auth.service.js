// src/services/auth.service.js (CONFIRMED)
import AdminUser from "../models/AdminUser.js";

async function loginService(email, password) {
  const user = await AdminUser.findOne({ where: { email } });

  if (!user) {
    return { success: false, message: "Invalid email or password" };
  }

  // Validate password (uses the method defined in AdminUser.js)
  const isValid = await user.isValidPassword(password);

  if (!isValid) {
    return { success: false, message: "Invalid email or password" };
  }

  // Return the authenticated user object
  return { success: true, user };
}

export default { loginService };
