import CoreUser from "../models/CoreUser.js";
import Sequelize, { Op, fn, col, literal } from "sequelize";
import Order from "../models/Order.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import Storefront from "../models/Storefront.js";
import Product from "../models/Product.js";

// Maps client-side role to DB roles
const roleMap = {
  seller: "seller",
  influencer: "influencer",
  shopper: "shopper", // Note: 'shopper' from frontend maps to 'customer' in DB
};

// ==============================
// GET USERS LIST (ADMIN)
// ==============================

export const getUsersList = async (req, res) => {
  try {
    const {
      role,
      filter,
      page = 1,
      limit = 20,
      sortBy = "created_at",
      sortOrder = "DESC",
      search = "",
      date_from,
      date_to,

      status,
      minSpent,
      maxSpent,
      minOrders,
      maxOrders,
      minSales,
      maxSales,
      minBalance,
      maxBalance,
      minProducts,
      maxProducts,
      storefrontStatus,
      verifiedStatus,
    } = req.query;
    console.log("=== FILTER DEBUG ===");
    console.log("Received filters:", {
      status,
      minSpent,
      maxSpent,
      minOrders,
      maxOrders,
      minSales,
      maxSales,
      minBalance,
      maxBalance,
      minProducts,
      maxProducts,
      storefrontStatus,
      verifiedStatus,
    });
    const whereClause = {};

    if (role) {
      const dbRole = roleMap[role.toLowerCase()] || role;
      whereClause.role = dbRole;
    }
    // ✅ Status filter
    if (status && status !== "allStatus") {
      whereClause.status = status;
    }
    if (search) {
      whereClause[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } },
        { status: { [Op.like]: `%${search}%` } },
      ];
    }

    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) whereClause.created_at[Op.gte] = new Date(date_from);
      if (date_to) whereClause.created_at[Op.lte] = new Date(date_to);
    }

    // if (filter === "linkedStorefront") {
    //   whereClause[Op.and] = literal(`
    //     EXISTS (
    //       SELECT 1 FROM storefronts
    //       WHERE storefronts.user_id = User.id
    //       AND storefronts.deleted_at IS NULL
    //     )
    //   `);
    // }
    // if (storefrontStatus && storefrontStatus !== "all") {
    //   if (storefrontStatus === "withStorefront") {
    //     whereClause[Op.and] = literal(`
    //       EXISTS (
    //         SELECT 1 FROM storefronts
    //         WHERE storefronts.user_id = User.id
    //         AND storefronts.deleted_at IS NULL
    //       )
    //     `);
    //   } else if (storefrontStatus === "withoutStorefront") {
    //     whereClause[Op.and] = literal(`
    //       NOT EXISTS (
    //         SELECT 1 FROM storefronts
    //         WHERE storefronts.user_id = User.id
    //         AND storefronts.deleted_at IS NULL
    //       )
    //     `);
    //   }
    // }
    if (
      filter === "linkedStorefront" ||
      storefrontStatus === "withStorefront"
    ) {
      whereClause[Op.and] = [
        ...(whereClause[Op.and] || []),
        literal(
          `EXISTS (SELECT 1 FROM storefronts WHERE storefronts.user_id = ${CoreUser.name}.id AND storefronts.deleted_at IS NULL)`,
        ),
      ];
    } else if (storefrontStatus === "withoutStorefront") {
      whereClause[Op.and] = [
        ...(whereClause[Op.and] || []),
        literal(
          `NOT EXISTS (SELECT 1 FROM storefronts WHERE storefronts.user_id = ${CoreUser.name}.id AND storefronts.deleted_at IS NULL)`,
        ),
      ];
    }

    if (filter === "suspended") {
      whereClause.status = "suspended";
    }

    const offset = (page - 1) * limit;

    /* ===============================
       1️⃣ USERS (FAST QUERY)
    =============================== */
    const [usersRaw, totalCount] = await Promise.all([
      CoreUser.findAll({
        where: whereClause,
        attributes: [
          "id",
          "first_name",
          "last_name",
          "phone_number",
          "email",
          "role",
          "created_at",
          "status",
          "state",
          "city",
          "country",
          "address",
          "business_name",
        ],
        order: [[sortBy, sortOrder]],
      }),
      CoreUser.count({ where: whereClause }),
    ]);

    const userIds = usersRaw.map((u) => u.id);
    if (!userIds.length) {
      return res.json({
        users: [],
        pagination: {
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: Number(page),
          limit: Number(limit),
        },
      });
    }

    /* ===============================
       2️⃣ PARALLEL AGGREGATES
    =============================== */
    const [
      ordersAgg,
      wallets,
      storefronts,
      salesAgg,
      brandWalletAgg,
      transactions,
      productsCount,
      recentProducts,
    ] = await Promise.all([
      Order.findAll({
        where: { user_id: userIds },
        attributes: [
          "user_id",
          [fn("COUNT", col("id")), "total_orders"],
          [
            fn(
              "SUM",
              literal("CASE WHEN status = 'paid' THEN grand_total ELSE 0 END"),
            ),
            "total_spent",
          ],
        ],
        group: ["user_id"],
      }),
      Wallet.findAll({ where: { user_id: userIds } }),
      Storefront.findAll({
        where: { user_id: userIds },
        attributes: ["user_id", "name"],
      }),
      Transaction.findAll({
        where: {
          user_id: userIds,
          type: "earning_influencer",
          status: "completed",
        },
        attributes: ["user_id", [fn("SUM", col("amount")), "total_sales"]],
        group: ["user_id"],
      }),
      Transaction.findAll({
        where: {
          user_id: userIds,
          [Op.or]: [
            { type: "earning_vendor", status: "completed" },
            { type: "earning_vendor", status: "pending" },
            { type: "payout", status: "completed" },
          ],
        },
        attributes: [
          "user_id",
          "type",
          "status",
          [fn("SUM", col("amount")), "total"],
        ],
        group: ["user_id", "type", "status"],
      }),
      Transaction.findAll({
        where: { user_id: userIds },
        order: [["created_at", "DESC"]],
      }),
      Product.findAll({
        where: { brand_id: userIds, deleted_at: null },
        attributes: ["brand_id", [fn("COUNT", col("id")), "total_products"]],
        group: ["brand_id"],
      }),
      Product.findAll({
        where: { brand_id: userIds, deleted_at: null },
        order: [["created_at", "DESC"]],
      }),
    ]);

    /* ===============================
       3️⃣ MAP RESULTS
    =============================== */
    const ordersMap = {};
    ordersAgg.forEach((o) => {
      ordersMap[o.user_id] = {
        total_orders: Number(o.get("total_orders")) || 0,
        total_spent: Number(o.get("total_spent")) || 0,
      };
    });

    const walletMap = {};
    wallets.forEach((w) => {
      walletMap[w.user_id] = w;
    });

    const storefrontMap = {};
    storefronts.forEach((s) => {
      storefrontMap[s.user_id] = s.name;
    });

    const salesMap = {};
    salesAgg.forEach((s) => {
      salesMap[s.user_id] = Number(s.get("total_sales")) || 0;
    });

    const brandWalletMap = {};
    brandWalletAgg.forEach((r) => {
      const uid = r.user_id;
      if (!brandWalletMap[uid]) {
        brandWalletMap[uid] = { total_earned: 0, pending: 0, withdrawn: 0 };
      }

      const total = Number(r.get("total")) || 0;
      if (r.type === "earning_vendor" && r.status === "completed")
        brandWalletMap[uid].total_earned += total;
      if (r.type === "earning_vendor" && r.status === "pending")
        brandWalletMap[uid].pending += total;
      if (r.type === "payout" && r.status === "completed")
        brandWalletMap[uid].withdrawn += total;
    });

    const recentTxMap = {};
    transactions.forEach((tx) => {
      if (!recentTxMap[tx.user_id]) recentTxMap[tx.user_id] = [];
      if (recentTxMap[tx.user_id].length < 2) recentTxMap[tx.user_id].push(tx);
    });

    const productsCountMap = {};
    productsCount.forEach((p) => {
      productsCountMap[p.brand_id] = Number(p.get("total_products")) || 0;
    });

    const recentProductsMap = {};
    recentProducts.forEach((p) => {
      if (!recentProductsMap[p.brand_id]) recentProductsMap[p.brand_id] = [];
      if (recentProductsMap[p.brand_id].length < 2)
        recentProductsMap[p.brand_id].push(p);
    });

    //     /* ===============================
    //        4️⃣ BUILD USERS WITH AGGREGATED DATA
    //     =============================== */
    //     let users = usersRaw.map((u) => {
    //       const wallet = walletMap[u.id] || {};
    //       const orders = ordersMap[u.id] || {};

    //       return {
    //         ...u.toJSON(),
    //         total_orders: orders.total_orders || 0,
    //         total_spent: orders.total_spent || 0,
    //         wallet_balance: wallet.balance || 0,
    //         wallet_account_number: wallet.account_number || null,
    //         wallet_bank_name: wallet.bank_name || null,
    //         wallet_account_name: wallet.account_name || null,
    //         storefront: storefrontMap[u.id] || "No Store",
    //         total_sales: salesMap[u.id] || 0,
    //         total_products: productsCountMap[u.id] || 0,
    //         recentTransactions: recentTxMap[u.id] || [],
    //         recentProducts: recentProductsMap[u.id] || [],
    //         brand_wallet: brandWalletMap[u.id] || {
    //           total_earned: 0,
    //           pending: 0,
    //           withdrawn: 0,
    //         },
    //       };
    //     });

    //     /* ===============================
    //        5️⃣ APPLY POST-AGGREGATION FILTERS
    //        (These filters require data from related tables)
    //     =============================== */

    //     // ✅ Filter by total spent range (for buyers)
    //     if (minSpent || maxSpent) {
    //       users = users.filter((u) => {
    //         const spent = Number(u.total_spent) || 0;
    //         if (minSpent && spent < Number(minSpent)) return false;
    //         if (maxSpent && spent > Number(maxSpent)) return false;
    //         return true;
    //       });
    //     }

    //     // ✅ Filter by total orders range (for buyers)
    //     if (minOrders || maxOrders) {
    //       users = users.filter((u) => {
    //         const orders = Number(u.total_orders) || 0;
    //         if (minOrders && orders < Number(minOrders)) return false;
    //         if (maxOrders && orders > Number(maxOrders)) return false;
    //         return true;
    //       });
    //     }

    //     // ✅ Filter by total sales range (for creators)
    //     if (minSales || maxSales) {
    //       users = users.filter((u) => {
    //         const sales = Number(u.total_sales) || 0;
    //         if (minSales && sales < Number(minSales)) return false;
    //         if (maxSales && sales > Number(maxSales)) return false;
    //         return true;
    //       });
    //     }

    //     // ✅ Filter by wallet balance range (for brands)
    //     if (minBalance || maxBalance) {
    //       users = users.filter((u) => {
    //         const balance = Number(u.wallet_balance) || 0;
    //         if (minBalance && balance < Number(minBalance)) return false;
    //         if (maxBalance && balance > Number(maxBalance)) return false;
    //         return true;
    //       });
    //     }

    //     // ✅ Filter by products count range (for brands)
    //     if (minProducts || maxProducts) {
    //       users = users.filter((u) => {
    //         const products = Number(u.total_products) || 0;
    //         if (minProducts && products < Number(minProducts)) return false;
    //         if (maxProducts && products > Number(maxProducts)) return false;
    //         return true;
    //       });
    //     }

    //     const pageNum = parseInt(page, 10) || 1;
    //     const limitNum = parseInt(limit, 10) || 20;

    //     const totalFiltered = users.length;
    //     const startIndex = (pageNum - 1) * limitNum;
    //     const endIndex = startIndex + limitNum;

    //     // 2. Perform the slice
    //     const paginatedUsers = users.slice(startIndex, endIndex);

    //     console.log(
    //       `Pagination Debug: Start ${startIndex}, End ${endIndex}, Total ${totalFiltered}`,
    //     );

    //     return res.json({
    //       users: paginatedUsers, // ⚡ Ensure you are returning the sliced array, not the original 'users'
    //       pagination: {
    //         totalItems: totalFiltered,
    //         totalPages: Math.ceil(totalFiltered / limitNum),
    //         currentPage: pageNum,
    //         limit: limitNum,
    //       },
    //     });
    //   } catch (error) {
    //     console.error("Get Users List Error:", error);
    //     return res.status(500).json({ message: "Failed to fetch users" });
    //   }
    // };
    let users = usersRaw.map((u) => {
      const orders = ordersMap[u.id] || { total_orders: 0, total_spent: 0 };
      return {
        ...u.toJSON(),
        total_orders: orders.total_orders,
        total_spent: orders.total_spent,
        wallet_balance: walletMap[u.id]?.balance || 0,
        storefront: storefrontMap[u.id] || "No Store",
        total_sales: salesMap[u.id] || 0,
        total_products: productsCountMap[u.id] || 0,
      };
    });

    // 8. FIX: Robust Post-Aggregation Filtering
    const applyRangeFilter = (data, val, min, max) => {
      const numericVal = parseFloat(val) || 0;
      if (min !== undefined && min !== "" && numericVal < parseFloat(min))
        return false;
      if (max !== undefined && max !== "" && numericVal > parseFloat(max))
        return false;
      return true;
    };

    if (minSpent || maxSpent)
      users = users.filter((u) =>
        applyRangeFilter(users, u.total_spent, minSpent, maxSpent),
      );
    if (minOrders || maxOrders)
      users = users.filter((u) =>
        applyRangeFilter(users, u.total_orders, minOrders, maxOrders),
      );
    if (minSales || maxSales)
      users = users.filter((u) =>
        applyRangeFilter(users, u.total_sales, minSales, maxSales),
      );
    if (minBalance || maxBalance)
      users = users.filter((u) =>
        applyRangeFilter(users, u.wallet_balance, minBalance, maxBalance),
      );
    if (minProducts || maxProducts)
      users = users.filter((u) =>
        applyRangeFilter(users, u.total_products, minProducts, maxProducts),
      );

    // 9. Manual Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const totalFiltered = users.length;
    const paginatedUsers = users.slice(
      (pageNum - 1) * limitNum,
      pageNum * limitNum,
    );

    return res.json({
      users: paginatedUsers,
      pagination: {
        totalItems: totalFiltered,
        totalPages: Math.ceil(totalFiltered / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Get Users List Error:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};
// ==============================
// UPDATE USER STATUS
// ==============================
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const user = await CoreUser.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.is_active = is_active;
    await user.save();

    return res.json({ message: "User status updated", user });
  } catch (error) {
    console.error("Update User Status Error:", error);
    return res.status(500).json({ message: "Failed to update user status" });
  }
};

// ==============================
// DELETE / ARCHIVE USER
// ==============================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await CoreUser.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Soft delete recommended
    user.is_active = false;
    await user.save();

    return res.json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ message: "Failed to delete user" });
  }
};
