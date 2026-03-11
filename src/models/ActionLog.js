import { DataTypes } from "sequelize";
import { adminDB } from "../config/database.js";

const ActionLog = adminDB.define(
  "ActionLog",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    admin_id: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false }, // e.g., "CREATE_ADMIN", "UPDATE_PRODUCT"
    target_type: { type: DataTypes.STRING, allowNull: false }, // e.g., "AdminUser", "Product"
    target_id: { type: DataTypes.INTEGER, allowNull: true },
    details: { type: DataTypes.JSON, allowNull: true }, // Store the changed data
  },
  {
    tableName: "action_logs",
    timestamps: true,
    underscored: true,
  },
);

export default ActionLog;
