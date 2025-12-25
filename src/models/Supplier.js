// src/models/Supplier.js
import { DataTypes } from "sequelize";
import { coreDB } from "../config/database.js";

const Supplier = coreDB.define(
  "Supplier",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    brand_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    contact_person: DataTypes.STRING,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: DataTypes.DATE,
  },
  {
    tableName: "suppliers",
    timestamps: true,
    underscored: true,
  }
);

export default Supplier;
