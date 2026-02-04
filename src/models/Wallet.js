import { DataTypes } from "sequelize";
import { coreDB } from "../config/database.js";
import CoreUser from "./CoreUser.js";

const Wallet = coreDB.define(
  "Wallet",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    balance: {
      type: DataTypes.DECIMAL(32, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    account_number: DataTypes.STRING,
    account_name: DataTypes.STRING,
    bank_name: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    tableName: "wallets",
    timestamps: true,
    underscored: true,
  },
);

// Wallet.belongsTo(CoreUser, { foreignKey: "user_id", as: "user" });
// CoreUser.hasOne(Wallet, { foreignKey: "user_id", as: "wallet" });

export default Wallet;
