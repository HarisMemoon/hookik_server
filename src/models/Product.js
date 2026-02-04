// src/models/Product.js
import { DataTypes } from "sequelize";
import { coreDB } from "../config/database.js";
import CoreUser from "./CoreUser.js";
import ProductCategory from "./ProductCategory.js"; // Import your category model

const Product = coreDB.define(
  "Product",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    category_id: { type: DataTypes.INTEGER, allowNull: true }, // main category
    sub_category_id: { type: DataTypes.INTEGER, allowNull: true },
    sub_sub_category_id: { type: DataTypes.INTEGER, allowNull: true },
    brand_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(36, 2), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "verified", "unverified", "suspended"),
      defaultValue: "pending",
    },
    sku: DataTypes.STRING,
    description: DataTypes.TEXT,
    maximum_weight: DataTypes.DECIMAL(8, 2),
    discount: { type: DataTypes.DECIMAL(36, 2), defaultValue: 0.0 },
    height: DataTypes.DECIMAL(8, 2),
    width: DataTypes.DECIMAL(8, 2),
    length: DataTypes.DECIMAL(8, 2),
    color: DataTypes.STRING,
    brand: DataTypes.STRING,
    specs: DataTypes.TEXT,
    tags: DataTypes.TEXT,
  },
  {
    tableName: "products",
    timestamps: true,
    underscored: true,
  },
);

// 🔹 DEFINE THE ASSOCIATIONS

// Brand (user who owns the product)
// Product.belongsTo(CoreUser, {
//   foreignKey: "brand_id",
//   as: "brandOwner",
// });

// // Categories
// Product.belongsTo(ProductCategory, {
//   foreignKey: "category_id",
//   as: "category",
// });

// Product.belongsTo(ProductCategory, {
//   foreignKey: "sub_category_id",
//   as: "subCategory",
// });

// Product.belongsTo(ProductCategory, {
//   foreignKey: "sub_sub_category_id",
//   as: "subSubCategory",
// });

export default Product;
