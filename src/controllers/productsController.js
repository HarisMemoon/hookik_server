import Product from "../models/Product.js";
import CoreUser from "../models/CoreUser.js";
import { Op } from "sequelize";

export const getProductsList = async (req, res) => {
  try {
    const {
      filter = "all", // 'all', 'pending', 'rejected'
      page = 1,
      limit = 20,
      search = "",
      status, // 'verified', 'suspended', etc.
    } = req.query;

    const whereClause = {};

    // 1. Handle Pill Filters based on Schema Enum: 'pending','verified','unverified','suspended'
    if (filter === "pending") {
      whereClause.status = "pending";
    } else if (filter === "rejected") {
      whereClause.status = "suspended"; // Mapping rejected to suspended status
    }

    // 2. Handle Status Dropdown from Filter Modal
    if (status) {
      whereClause.status = status;
    }

    // 3. Search by Product Name or SKU
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: CoreUser,
          as: "brandOwner", // Matches foreign key brand_id
          attributes: ["id", "first_name", "last_name"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: Number(limit),
      offset,
    });

    return res.json({
      products: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({ message: "Failed to fetch products" });
  }
};
