// ----------------- FIXED CONTROLLER -----------------
import { Op, Sequelize } from "sequelize";
import CoreUser from "../models/CoreUser.js";
import Storefront from "../models/Storefront.js";
import Supplier from "../models/Supplier.js";
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import Product from "../models/Product.js";

async function getUserTotals() {
  const q = `
    SELECT
      COUNT(*) AS total_users,
      SUM(CASE WHEN role = 'seller' THEN 1 ELSE 0 END) AS brand_count,
      SUM(CASE WHEN role = 'influencer' THEN 1 ELSE 0 END) AS influencer_count,
      SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) AS customer_count
    FROM users
    WHERE role IN ('seller', 'influencer', 'customer');
  `;
  const [result] = await CoreUser.sequelize.query(q, {
    type: Sequelize.QueryTypes.SELECT,
  });
  return result;
}

async function getActiveInfluencersWithStorefronts() {
  const query = `
    SELECT COUNT(DISTINCT u.id) as count
    FROM users u
    INNER JOIN storefronts s ON u.id = s.user_id
    WHERE u.role = 'influencer'
      AND s.deleted_at IS NULL
  `;

  const [result] = await CoreUser.sequelize.query(query, {
    type: Sequelize.QueryTypes.SELECT,
  });

  return result.count || 0;
}

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
          0,
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

// Top Creators - FIX THIS
async function getTopCreators() {
  return Transaction.findAll({
    attributes: [
      [
        Sequelize.fn(
          "COALESCE",
          Sequelize.fn("SUM", Sequelize.col("amount")),
          0,
        ),
        "totalEarnings",
      ],
      [Sequelize.col("owner.first_name"), "creatorName"],
      [Sequelize.col("owner.last_name"), "creatorLastName"],
      [Sequelize.col("owner.id"), "creatorId"],
    ],
    where: {
      type: "earning_influencer",
      status: "completed",
    },
    include: [
      {
        model: CoreUser,
        as: "owner", // ✅ ADD THIS - you were missing it!
        attributes: [],
        required: true,
      },
    ],
    group: ["owner.id", "owner.first_name", "owner.last_name"],
    order: [[Sequelize.literal("totalEarnings"), "DESC"]],
    limit: 5,
    raw: true,
  });
}

// Active Payouts List - FIX THIS TOO
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
        as: "owner", // ✅ ADD THIS - you were missing it!
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
      Storefront.count({
        where: {
          is_public: true,
        },
      }),
      Supplier.count(),

      // ✅ FIXED: Use the helper function
      getActiveInfluencersWithStorefronts(),

      getUserTotals(),
      Order.sum("grand_total", {
        where: {
          status: "shipped",
        },
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
        attributes: ["id", "name", "created_at"],
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
      activeSuppliersCount, // ✅ This is now the count from getActiveInfluencersWithStorefronts()
      userTotals,
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

    // Calculate Platform Net Fee
    const totalSalesFloat = parseFloat(totalSalesVolume || 0);
    const distributedEarnings = (revenueBreakdown || []).reduce(
      (sum, item) => sum + (parseFloat(item.totalAmount) || 0),
      0,
    );

    const grossFixed = parseFloat(totalSalesFloat.toFixed(2));
    const distributedFixed = parseFloat(distributedEarnings.toFixed(2));
    const platformNetFee = Math.max(
      0,
      parseFloat((grossFixed - distributedFixed).toFixed(2)),
    );

    if (platformNetFee > 0) {
      revenueBreakdown.push({
        type: "platform_fee",
        totalAmount: platformNetFee.toFixed(2),
      });
    }

    const topCreators = (topCreatorsRaw || []).map((c) => ({
      id: c.creatorId,
      name: `${c.creatorName || ""} ${c.creatorLastName || ""}`.trim(),
      sales: parseFloat(c.totalEarnings) || 0,
    }));

    const safeUserTotals = userTotals || {
      total_users: 0,
      brand_count: 0,
      influencer_count: 0,
      customer_count: 0,
    };

    return res.json({
      stats: {
        totalUsers: safeUserTotals.total_users,
        totalBrands: safeUserTotals.brand_count,
        totalInfluencers: safeUserTotals.influencer_count,
        totalCustomers: safeUserTotals.customer_count,
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
