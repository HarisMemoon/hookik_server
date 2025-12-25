import { DataTypes } from "sequelize";
import { coreDB } from "../config/database.js";
import CoreUser from "./CoreUser.js"; // Import your User model

const Storefront = coreDB.define(
  "Storefront",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    is_public: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: DataTypes.DATE,
  },
  {
    tableName: "storefronts",
    timestamps: true,
    underscored: true,
  }
);

// Define associations HERE, not in the controller
Storefront.belongsTo(CoreUser, {
  foreignKey: "user_id",
  as: "owner",
});

export default Storefront;
