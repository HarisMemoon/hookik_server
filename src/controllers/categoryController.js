import Category from "../models/Category.js";
import { Op } from "sequelize";

export const getCategoriesList = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "" } = req.query;

    const whereClause = {
      is_active: true, // Standard filter to only show active categories
    };

    // Search by category name
    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Category.findAndCountAll({
      where: whereClause,
      attributes: ["id", "name", "slug", "parent_id"], // Only return what you need
      order: [["name", "ASC"]],
      limit: Number(limit),
      offset,
    });

    return res.json({
      categories: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    return res.status(500).json({ message: "Failed to fetch categories" });
  }
};
