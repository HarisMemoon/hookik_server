import CoreUser from "../models/CoreUser.js";
import { Op } from "sequelize";

// Maps client-side role to DB roles
const roleMap = {
  seller: "seller",
  influencer: "influencer",
  shopper: "shopper", // Note: 'shopper' from frontend maps to 'customer' in DB
};

// ==============================
// GET USERS LIST (ADMIN)
// ==============================
export const getUsersList = async (req, res) => {
  try {
    const {
      role, // Now accepting 'role' instead of 'type'
      page = 1,
      limit = 20,
      sortBy = "created_at",
      sortOrder = "DESC",
      search = "",
      date_from,
      date_to,
    } = req.query;

    const whereClause = {};

    // Role filter - map frontend role to backend role
    if (role) {
      const dbRole = roleMap[role.toLowerCase()] || role;
      whereClause.role = dbRole;
    }

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone_number: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Date range filter
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) {
        whereClause.created_at[Op.gte] = new Date(date_from);
      }
      if (date_to) {
        whereClause.created_at[Op.lte] = new Date(date_to);
      }
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await CoreUser.findAndCountAll({
      where: whereClause,
      attributes: [
        "id",
        "first_name",
        "last_name",
        "phone_number",
        "email",
        "role",
        "created_at",
      ],
      order: [[sortBy, sortOrder]],
      limit: Number(limit),
      offset,
    });

    return res.json({
      users: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Get Users List Error:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ==============================
// UPDATE USER STATUS
// ==============================
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const user = await CoreUser.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.is_active = is_active;
    await user.save();

    return res.json({ message: "User status updated", user });
  } catch (error) {
    console.error("Update User Status Error:", error);
    return res.status(500).json({ message: "Failed to update user status" });
  }
};

// ==============================
// DELETE / ARCHIVE USER
// ==============================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await CoreUser.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Soft delete recommended
    user.is_active = false;
    await user.save();

    return res.json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ message: "Failed to delete user" });
  }
};
