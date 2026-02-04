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
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "storefronts",
    timestamps: true,
    underscored: true,
    paranoid: true, // respects deleted_at
    freezeTableName: true,
  },
);

export default Storefront;
