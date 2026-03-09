import { DataTypes } from "sequelize";
import { coreDB } from "../config/database.js";

const Image = coreDB.define(
  "Image",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageable_type: {
      type: DataTypes.ENUM("product", "product_variant"),
      allowNull: false,
    },
    imageable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "images",
    timestamps: true, // This maps to created_at and updated_at
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true, // This handles the deleted_at logic automatically
    deletedAt: "deleted_at",
  },
);

export default Image;
