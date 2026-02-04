// src/models/ProductCategory.js
import { DataTypes } from "sequelize";
import { coreDB } from "../config/database.js";

const ProductCategory = coreDB.define(
  "ProductCategory",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false },
    parent_id: { type: DataTypes.INTEGER, allowNull: true }, // for subcategories
    category_api_id: { type: DataTypes.INTEGER, allowNull: false },
    max_weight: DataTypes.FLOAT,
    max_height: DataTypes.FLOAT,
    max_width: DataTypes.FLOAT,
    max_length: DataTypes.FLOAT,
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    deleted_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "product_categories",
    timestamps: true,
    underscored: true,
  },
);

// 🔹 Self-association for parent-child relationship
// ProductCategory.hasMany(ProductCategory, {
//   foreignKey: "parent_id",
//   as: "subCategories",
// });

// ProductCategory.belongsTo(ProductCategory, {
//   foreignKey: "parent_id",
//   as: "parentCategory",
// });

export default ProductCategory;
