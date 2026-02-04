import Transaction from "../models/Transaction.js";
import CoreUser from "../models/CoreUser.js";

export const getPayoutsList = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const whereClause = {
      type: "payout", // 🔴 THIS IS THE KEY REQUIREMENT
    };

    if (status) {
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
