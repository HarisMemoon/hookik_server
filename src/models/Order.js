import { DataTypes } from "sequelize";
import { coreDB } from "../config/database.js";
import CoreUser from "./CoreUser.js";

const Order = coreDB.define(
  "Order",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_code: { type: DataTypes.STRING, allowNull: false },
    user_id: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM("pending", "paid", "shipped", "delivered"),
      defaultValue: "pending",
    },
    grand_total: DataTypes.DECIMAL(65, 2),
    tracking_number: DataTypes.STRING,
    created_at: DataTypes.DATE,
  },
  {
    tableName: "orders",
    timestamps: true,
    underscored: true,
  },
);

/** Associations */
// Order.belongsTo(CoreUser, { foreignKey: "user_id", as: "buyer" });
// CoreUser.hasMany(Order, { foreignKey: "user_id", as: "orders" });

export default Order;
