import Order from "../models/Order.js";
import CoreUser from "../models/CoreUser.js";
import { Op } from "sequelize";

export const getOrdersList = async (req, res) => {
  try {
    const { filter = "all", page = 1, limit = 20, search = "" } = req.query;

    const whereClause = {};

    // Tab Filters
    if (filter === "inProgress") {
      whereClause.status = "pending";
    } else if (filter === "completed") {
      whereClause.status = "shipped";
    } else if (filter === "disputed") {
      whereClause.status = "partial";
    }

    // Search
    if (search) {
      whereClause[Op.or] = [
        { order_code: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: CoreUser,
          as: "buyer",
          attributes: ["first_name", "last_name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: Number(limit),
      offset,
    });

    return res.json({
      orders: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};
