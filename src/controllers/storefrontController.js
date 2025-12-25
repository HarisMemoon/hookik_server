import Storefront from "../models/Storefront.js";
import CoreUser from "../models/CoreUser.js"; // Assuming your model name is User or CoreUser
import { Op } from "sequelize";

export const getStorefrontsList = async (req, res) => {
  try {
    const {
      filter = "all", // 'all', 'pending'
      page = 1,
      limit = 20,
      search = "",
      status, // 'active', 'disabled'
    } = req.query;

    const whereClause = {};

    // 1. Handle Pill Filters
    if (filter === "pending") {
      whereClause.is_public = false; // Example: pending means not yet public
    }

    // 2. Handle Status Dropdown from Filter Modal
    if (status) {
      whereClause.is_public = status === "active";
    }

    // 3. Search by Storefront Name
    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Storefront.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: CoreUser,
          as: "owner", // Ensure this alias matches your association
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: Number(limit),
      offset,
    });

    return res.json({
      storefronts: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Get Storefronts Error:", error);
    return res.status(500).json({ message: "Failed to fetch storefronts" });
  }
};
