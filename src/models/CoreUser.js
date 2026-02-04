// src/models/CoreUser.js
import { DataTypes } from "sequelize";
import { coreDB } from "../config/database.js";

const CoreUser = coreDB.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Key attributes for filtering/identification
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    role: {
      // Matches the ENUM in your SQL schema: 'influencer', 'admin', 'customer', 'seller'
      type: DataTypes.ENUM("influencer", "admin", "customer", "seller"),
      allowNull: true,
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    created_at: DataTypes.DATE, // Sequelize handles timestamps automatically but good for clarity
  },
  {
    tableName: "users",
    timestamps: true, // Use created_at and updated_at
    underscored: true,
  },
);

export default CoreUser;
