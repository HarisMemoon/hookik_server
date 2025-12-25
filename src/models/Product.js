// src/models/Product.js
import { DataTypes } from "sequelize";
import { coreDB } from "../config/database.js";
import CoreUser from "./CoreUser.js"; // Import your User model

const Product = coreDB.define(
  "Product",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    brand_id: { type: DataTypes.INTEGER, allowNull: false }, //
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(36, 2), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "verified", "unverified", "suspended"),
      defaultValue: "pending",
    },
    sku: DataTypes.STRING,
    // ... add other fields from your schema if needed
  },
  {
    tableName: "products",
    timestamps: true,
    underscored: true,
  }
);

// 🔹 DEFINE THE ASSOCIATION HERE
// This connects the 'brand_id' in products to 'id' in users
Product.belongsTo(CoreUser, {
  foreignKey: "brand_id",
  as: "brandOwner",
});

export default Product;
