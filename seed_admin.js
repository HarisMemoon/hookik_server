import AdminUser from "./src/models/AdminUser.js";
import { adminDB } from "./src/config/database.js";

async function createAdmin() {
  try {
    await adminDB.authenticate();
    console.log("Connected to admin DB");

    const admin = await AdminUser.create({
      email: "admin@hookik.com",
      password: "12345678",
      role: "super_admin",
    });

    console.log("Admin created:", admin.email);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createAdmin();
