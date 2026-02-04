import { DataTypes } from "sequelize";
import { coreDB } from "../config/database.js";
import CoreUser from "./CoreUser.js";
import Product from "./Product.js";

const Collection = coreDB.define(
  "Collection",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    commision: {
      type: DataTypes.DECIMAL(36, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    is_available_on_store_front: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: { type: DataTypes.DATE, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: false },
    deleted_at: { type: DataTypes.DATE },
  },
  {
    tableName: "collections",
    timestamps: true,
    underscored: true,
    paranoid: true, // respects deleted_at
    freezeTableName: true,
  },
);

// Associations
// Collection.belongsTo(CoreUser, { foreignKey: "user_id", as: "owner" });
// Collection.belongsTo(Product, { foreignKey: "product_id", as: "product" });

export default Collection;
