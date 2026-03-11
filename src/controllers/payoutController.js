import Transaction from "../models/Transaction.js";
import CoreUser from "../models/CoreUser.js";
import { coreDB } from "../config/database.js";
import { Op } from "sequelize";

export const getPayoutsList = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const whereClause = {
      type: "payout",
    };

    if (status === "failed") {
      whereClause.status = {
        [Op.in]: ["failed", "cancelled"],
      };
    } else if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: CoreUser,
          as: "owner",
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: Number(limit),
      offset,
    });
    if (rows.length > 0) {
      console.log("First Row Owner:", rows[0].owner);
    } else {
      console.log("No payouts found for the given criteria.");
    }

    return res.json({
      payouts: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / Number(limit)),
        currentPage: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Get Payouts Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// 1. Approve a Single Payout
export const approvePayout = async (req, res) => {
  try {
    const { id } = req.params;

    const payout = await Transaction.findByPk(id);

    if (!payout) {
      return res.status(404).json({ message: "Payout record not found" });
    }

    // Update status to completed
    payout.status = "completed";
    payout.updated_at = new Date();
    await payout.save();

    return res.json({ message: "Payout approved successfully", payout });
  } catch (error) {
    console.error("Approve Payout Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// 2. Process Bulk Payouts
export const bulkProcessPayouts = async (req, res) => {
  const { ids } = req.body; // Expecting an array of IDs: [90, 91, 92]

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No payout IDs provided" });
  }

  const t = await coreDB.transaction();

  try {
    await Transaction.update(
      {
        status: "completed",
        updated_at: new Date(),
      },
      {
        where: { id: ids },
        transaction: t,
      },
    );

    await t.commit();
    return res.json({
      message: `Successfully processed ${ids.length} payouts`,
    });
  } catch (error) {
    await t.rollback();
    console.error("Bulk Payout Error:", error);
    return res.status(500).json({ message: "Failed to process bulk payouts" });
  }
};
