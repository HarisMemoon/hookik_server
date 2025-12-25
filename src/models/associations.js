// src/models/associations.js
import CoreUser from "./CoreUser.js";
import Transaction from "./Transaction.js";
import Order from "./Order.js";

export function setupAssociations() {
  // 1. User <-> Transaction (for earnings and payouts)
  CoreUser.hasMany(Transaction, { foreignKey: "user_id" });
  Transaction.belongsTo(CoreUser, { foreignKey: "user_id" });

  // 2. User <-> Order (if needed for user order history)
  CoreUser.hasMany(Order, { foreignKey: "user_id" });
  Order.belongsTo(CoreUser, { foreignKey: "user_id" });

  // Add other necessary associations here (e.g., User <-> Storefront)
}
