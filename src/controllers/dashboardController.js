// ----------------- FIXED CONTROLLER -----------------
import { Op, Sequelize } from "sequelize";
import CoreUser from "../models/CoreUser.js";
import Storefront from "../models/Storefront.js";
import Supplier from "../models/Supplier.js";
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import Product from "../models/Product.js";
import { setupAssociations } from "../models/associations.js";
import { log } from "console";
setupAssociations();

// ---------- Helper Queries ----------

// User Growth
async function getUserGrowthData() {
  const q = `
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, 
           COUNT(*) AS total_count,
           SUM(CASE WHEN role = 'seller' THEN 1 ELSE 0 END) AS brand_count,
           SUM(CASE WHEN role = 'influencer' THEN 1 ELSE 0 END) AS influencer_count
    FROM users
    WHERE role IN ('seller', 'influencer', 'customer')
    GROUP BY month
    ORDER BY month ASC;
  `;
  return CoreUser.sequelize.query(q, { type: Sequelize.QueryTypes.SELECT });
}

// Revenue Breakdown
async function getRevenueBreakdown() {
  return Transaction.findAll({
    attributes: [
      "type",
      [
        Sequelize.fn(
          "COALESCE",
          Sequelize.fn("SUM", Sequelize.col("amount")),
          0
        ),
        "totalAmount",
      ],
    ],
    where: {
      type: { [Op.in]: ["earning_vendor", "earning_influencer"] },
      status: "completed",
    },
    group: ["type"],
    raw: true,
  });
}

// Top Creators (FIXED ALIAS → User)
async function getTopCreators() {
  return Transaction.findAll({
    attributes: [
      [
        Sequelize.fn(
          "COALESCE",
          Sequelize.fn("SUM", Sequelize.col("amount")),
          0
        ),
        "totalEarnings",
      ],
      [Sequelize.col("User.first_name"), "creatorName"],
      [Sequelize.col("User.last_name"), "creatorLastName"],
      [Sequelize.col("User.id"), "creatorId"],
    ],
    where: {
      type: "earning_influencer",
      status: "completed",
    },
    include: [
      {
        model: CoreUser,
        attributes: [],
        required: true,
      },
    ],
    group: ["User.id", "User.first_name", "User.last_name"],
    order: [[Sequelize.literal("totalEarnings"), "DESC"]],
    limit: 5,
    raw: true,
  });
}

// Active Payouts List (alias → User)
async function getActivePayoutsList() {
  return Transaction.findAll({
    attributes: ["id", "amount", "status", "created_at"],
    where: {
      type: "payout",
      status: { [Op.in]: ["pending", "processing"] },
    },
    include: [
      {
        model: CoreUser,
        attributes: ["first_name", "last_name", "role"],
        required: true,
      },
    ],
    order: [["created_at", "DESC"]],
    limit: 5,
    raw: true,
    nest: true,
  });
}

// Monthly Engagement
async function getMonthlyEngagement() {
  const q = `
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, 
           COUNT(*) AS total_orders
    FROM orders
    GROUP BY month
    ORDER BY month ASC;
  `;
  return Order.sequelize.query(q, {
    type: Sequelize.QueryTypes.SELECT,
  });
}

// ----------------- MAIN CONTROLLER -----------------
export const getDashboardData = async (req, res) => {
  try {
    const results = await Promise.all([
      Storefront.count({ where: { is_public: true } }),
      Supplier.count(),
      Supplier.count({ where: { is_active: true } }),
      CoreUser.count({
        where: { role: { [Op.in]: ["seller", "influencer", "customer"] } },
      }),

      Order.sum("grand_total", {
        where: { status: { [Op.in]: ["paid", "shipped", "delivered"] } },
      }),
      Transaction.sum("amount", {
        where: { type: "payout", status: "pending" },
      }),

      Storefront.findAll({
        attributes: ["id", "name", "created_at"],
        order: [["created_at", "DESC"]],
        limit: 5,
      }),
      Supplier.findAll({
        attributes: ["id", "name", "contact_person", "created_at"],
        order: [["created_at", "DESC"]],
        limit: 5,
      }),

      Product.findAll({
        attributes: ["id", "name", "brand_id", "created_at"],
        where: { status: "pending" },
        limit: 5,
      }),
      Storefront.findAll({
        attributes: ["id", "name", "user_id", "created_at"],
        where: { is_public: false },
        limit: 5,
      }),

      getRevenueBreakdown(),
      getTopCreators(),
      getMonthlyEngagement(),
      getUserGrowthData(),

      getActivePayoutsList(),
    ]);

    const [
      activeStorefrontsCount,
      totalSuppliersCount,
      activeSuppliersCount,
      totalUsersCount,
      totalSalesVolume,
      pendingPayoutsAmount,
      recentStorefronts,
      recentSuppliers,
      pendingProductApprovals,
      pendingStorefrontApprovals,
      revenueBreakdown,
      topCreatorsRaw,
      monthlyEngagement,
      userGrowth,
      activePayoutsListRaw,
    ] = results;
    // ----------------------------------------------------
    // 1. CALCULATE PLATFORM NET FEE (THE THIRD SLICE)
    // ----------------------------------------------------
    const totalSalesFloat = parseFloat(totalSalesVolume || 0);
    const distributedEarnings = (revenueBreakdown || []).reduce(
      (sum, item) => sum + (parseFloat(item.totalAmount) || 0),
      0
    );

    // Force fixed precision before subtraction
    const grossFixed = parseFloat(totalSalesFloat.toFixed(2));
    const distributedFixed = parseFloat(distributedEarnings.toFixed(2));

    const platformNetFee =
      grossFixed > distributedFixed ? grossFixed - distributedFixed : 0;

    // 2. Add the Platform Fee as the Third Slice to the revenueBreakdown array
    if (platformNetFee > 0) {
      revenueBreakdown.push({
        type: "platform_fee",
        totalAmount: platformNetFee.toFixed(2), // Format as string for consistency
      });
    }
    const topCreators = (topCreatorsRaw || []).map((c) => ({
      id: c.creatorId,
      name: `${c.creatorName || ""} ${c.creatorLastName || ""}`.trim(),
      sales: parseFloat(c.totalEarnings) || 0,
    }));
    return res.json({
      stats: {
        totalUsers: totalUsersCount || 0,
        activeStorefronts: activeStorefrontsCount || 0,
        totalSuppliers: totalSuppliersCount || 0,
        activeSuppliers: activeSuppliersCount || 0,
        totalSalesVolume: totalSalesVolume || 0,
        pendingPayouts: pendingPayoutsAmount || 0,
      },
      userGrowth,
      revenueBreakdown,
      topCreators,
      monthlyEngagement,
      recentStorefronts,
      recentSuppliers,
      pendingApprovals: {
        products: pendingProductApprovals,
        storefronts: pendingStorefrontApprovals,
      },
      activePayouts: activePayoutsListRaw,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    return res.status(500).json({ error: "Server Error" });
  }
};
