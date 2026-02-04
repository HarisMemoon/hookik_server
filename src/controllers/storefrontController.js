import Storefront from "../models/Storefront.js";
import CoreUser from "../models/CoreUser.js"; // Assuming your model name is User or CoreUser
import Sequelize, { Op, fn, col, literal } from "sequelize";

export const getStorefrontsList = async (req, res) => {
  try {
    const {
      filter = "all", // 'all', 'pending'
      page = 1,
      limit = 20,
      search = "",
      status, // 'active', 'disabled'
      minProducts,
      maxProducts,
    } = req.query;

    const whereClause = {};

    // 1. Handle Pill Filters
    if (filter === "pending") {
      whereClause.is_public = false; // Example: pending means not yet public
    }

    // 2. Handle Status Dropdown from Filter Modal
    if (status === "active") {
      whereClause.is_public = true;
    } else if (status === "disabled") {
      whereClause.is_public = false;
    } else if (status === "all") {
      // do nothing, include all storefronts
    }
    // status === "all" → do nothing

    if (minProducts || maxProducts) {
      const min = parseInt(minProducts, 10) || 0;
      const max = parseInt(maxProducts, 10) || 999999;

      whereClause[Op.and] = [
        ...(whereClause[Op.and] || []),
        Sequelize.literal(`(
      SELECT COUNT(*)
      FROM collections AS c
      WHERE c.user_id = Storefront.user_id 
        AND c.is_available_on_store_front = 1
        AND c.deleted_at IS NULL
    ) BETWEEN ${min} AND ${max}`),
      ];
    }
    // 3. Search by Storefront Name
    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Storefront.findAndCountAll({
      attributes: [
        "id",
        "name",
        "description", // ✅ ADD THIS
        "is_public",
        "created_at",
      ],
      where: whereClause,
      include: [
        {
          model: CoreUser,
          as: "owner",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "email",
            [
              Sequelize.literal(`(
            SELECT COUNT(*)
            FROM collections
            WHERE collections.user_id = owner.id
              AND collections.is_available_on_store_front = 1
              AND collections.deleted_at IS NULL
          )`),
              "total_products",
            ],
          ],
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
// controllers/storefrontController.js

export const updateStorefront = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_public } = req.body;

    const storefront = await Storefront.findByPk(id);

    if (!storefront) {
      return res.status(404).json({ message: "Storefront not found" });
    }

    // 🔒 Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({
        message: "Storefront name is required",
      });
    }

    await storefront.update({
      name: name.trim(),
      description: description ?? storefront.description,
      is_public: is_public === "1" || is_public === true,
    });

    return res.json({
      message: "Storefront updated successfully",
      storefront,
    });
  } catch (error) {
    console.error("Update Storefront Error:", error);
    return res.status(500).json({ message: "Failed to update storefront" });
  }
};
