import { DataTypes } from "sequelize";
import { coreDB } from "../config/database.js";
import CoreUser from "./CoreUser.js";

const Transaction = coreDB.define(
  "Transaction",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: DataTypes.INTEGER,
    wallet_id: DataTypes.INTEGER,
    amount: { type: DataTypes.DECIMAL(32, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "completed", "failed", "cancelled"),
      defaultValue: "pending",
    },
    type: {
      type: DataTypes.ENUM(
        "credit",
        "debit",
        "payout",
        "earning_vendor",
        "earning_influencer",
        "earning_referral",
      ),
      allowNull: false,
    },
    ref: DataTypes.TEXT,
    description: DataTypes.TEXT,
    metadata: DataTypes.JSON,
    // Add these explicitly to match your SQL 'datetime'
    created_at: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updated_at: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
  },
  {
    tableName: "transactions", // Must be lowercase to match your SQL
    timestamps: true,
    underscored: true,
    freezeTableName: true, // <--- ADD THIS: Stops Sequelize from trying to be smart
  },
);

// Transaction.belongsTo(CoreUser, { foreignKey: "user_id", as: "owner" });

export default Transaction;
