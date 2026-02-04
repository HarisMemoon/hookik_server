import { DataTypes } from "sequelize";
import { coreDB } from "../config/database.js";

const Category = coreDB.define(
  "Category",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false },
    parent_id: { type: DataTypes.INTEGER },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  },
  {
    tableName: "product_categories",
    timestamps: true,
    underscored: true,
    paranoid: true, // Handles the deleted_at field automatically
  },
);

/** Self-association for parent/child categories */
// Category.belongsTo(Category, { foreignKey: "parent_id", as: "parent" });
// Category.hasMany(Category, { foreignKey: "parent_id", as: "subCategories" });

export default Category;
