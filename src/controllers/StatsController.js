import Sequelize, { Op, fn, col, literal } from "sequelize";
import CoreUser from "../models/CoreUser.js";
import Transaction from "../models/Transaction.js";
import Product from "../models/Product.js";
import Wallet from "../models/Wallet.js";

export const getStats = async (req, res) => {
  try {
    /* ===============================
       CREATORS (INFLUENCERS)
    =============================== */

    const [totalCreators, creatorsWithStorefronts, totalInfluencerSales] =
      await Promise.all([
        CoreUser.count({
          where: { role: "influencer" },
        }),

        CoreUser.count({
          where: {
            role: "influencer",
            [Op.and]: literal(`
              EXISTS (
                SELECT 1 FROM storefronts
                WHERE storefronts.user_id = User.id
                AND storefronts.deleted_at IS NULL
              )
            `),
          },
        }),

        Transaction.findOne({
          where: {
            type: "earning_influencer",
            status: "completed",
          },
          attributes: [[fn("SUM", col("amount")), "total"]],
          raw: true,
        }),
      ]);

    const creatorsStats = [
      {
        title: "Total Creators",
        value: totalCreators,
        iconName: "TrendingUp",
      },
      {
        title: "With Storefronts",
        value: creatorsWithStorefronts,
        iconName: "Store",
      },
      {
        title: "Total Sales",
        value: Number(totalInfluencerSales?.total || 0),
        iconName: "Target",
      },
    ];

    /* ===============================
       BRANDS (SELLERS)
    =============================== */

    const sellerIds = await CoreUser.findAll({
      where: { role: "seller" },
      attributes: ["id"],
      raw: true,
    });
    const sellerUserIds = sellerIds.map((u) => u.id);

    const [totalProducts, totalWalletBalance] = await Promise.all([
      Product.count({
        where: { brand_id: sellerUserIds, deleted_at: null },
      }),

      Wallet.findOne({
        where: { user_id: sellerUserIds },
        attributes: [[fn("SUM", col("balance")), "total"]],
        raw: true,
      }),
    ]);

    const brandsStats = [
      {
        title: "Total No of Brands",
        value: sellerUserIds.length,
        iconName: "Building2",
      },
      {
        title: "Total Products",
        value: totalProducts,
        iconName: "Box",
      },
      {
        title: "Total Wallet Balance",
        value: Number(totalWalletBalance?.total || 0),
        iconName: "DollarSign",
      },
    ];

    return res.json({
      creatorsStats,
      brandsStats,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};
