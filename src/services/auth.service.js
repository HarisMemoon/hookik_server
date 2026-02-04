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

  return { success: true, user };
}

// ✅ Added Registration Service
async function registerService(email, password) {
  try {
    // 1. Check if email already exists to prevent Sequelize UniqueConstraintError
    const existingUser = await AdminUser.findOne({ where: { email } });
    if (existingUser) {
      return { success: false, message: "Email already registered" };
    }

    // 2. Create the user
    // The 'role' defaults to 'moderator' per your DB schema
    // Password hashing should be handled in your AdminUser model hooks
    const newUser = await AdminUser.create({
      email,
      password,
    });

    return { success: true, user: newUser };
  } catch (error) {
    console.error("Registration Service Error:", error);
    throw error;
  }
}

export default { loginService, registerService };
