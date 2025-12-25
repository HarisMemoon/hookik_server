// src/models/Transaction.js
import { DataTypes } from "sequelize";
import { coreDB } from "../config/database.js";

const Transaction = coreDB.define(
  "Transaction",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL(32, 2),
    // Matches ENUM('credit','debit','payout','earning_vendor','earning_influencer')
    type: DataTypes.ENUM(
      "credit",
      "debit",
      "payout",
      "earning_vendor",
      "earning_influencer"
    ),
    // Matches ENUM('pending','completed','failed','cancelled')
    status: DataTypes.ENUM("pending", "completed", "failed", "cancelled"),
    created_at: DataTypes.DATE,
  },
  {
    tableName: "transactions",
    timestamps: true,
    underscored: true,
  }
);

export default Transaction;
