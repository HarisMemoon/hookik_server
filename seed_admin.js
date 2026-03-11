import AdminUser from "./src/models/AdminUser.js";
import { adminDB } from "./src/config/database.js";

async function createAdmin() {
  try {
    await adminDB.authenticate();
    console.log("Connected to admin DB");

    // Clear existing test admin to avoid Unique Constraint error
    await AdminUser.destroy({ where: { email: "admin@hookik.com" } });

    const admin = await AdminUser.create({
      first_name: "Super",
      last_name: "Admin",
      email: "admin@hookik.com",
      password: "12345678",
      role: "super_admin",
      permissions: ["Full System Access", "Manage Admin Roles"],
      duration: "Permanent",
      status: "Active",
      // dateCreated will be handled by the defaultValue/field mapping
    });

    console.log(
      "✅ Admin created with Name:",
      admin.first_name,
      admin.last_name,
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
