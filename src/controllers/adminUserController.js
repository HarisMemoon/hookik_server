import AdminUser from "../models/AdminUser.js";
import { logAction } from "../utils/logger.js";

export const createAdminUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      role,
      permissions,
      duration,
      password,
    } = req.body;

    // Check if email exists
    const existing = await AdminUser.findOne({ where: { email } });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });

    // Create the admin
    const admin = await AdminUser.create({
      first_name: firstName,
      last_name: lastName,
      email,
      role,
      password: password || "12345678", // Required field
      permissions,
      duration,
      status: "Active",
    });
    await logAction(req.admin.id, "CREATE_ADMIN", "AdminUser", admin.id, {
      email,
    });

    res.status(201).json({ success: true, data: admin });
  } catch (error) {
    console.error("Create Admin Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const admins = await AdminUser.findAll({
      order: [["dateCreated", "DESC"]],
    });

    res.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const deleteAdminUser = async (req, res) => {
  try {
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can delete admins",
      });
    }

    const { id } = req.params;

    await AdminUser.destroy({ where: { id } });

    res.json({ success: true, message: "Admin deleted" });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, status, permissions } = req.body;

    // Only allow specific fields to be updated
    const [updated] = await AdminUser.update(
      {
        first_name: firstName,
        last_name: lastName,
        role,
        status,
        permissions,
      },
      { where: { id } },
    );

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    res.json({ success: true, message: "Admin updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
