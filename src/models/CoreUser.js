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
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    password: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    gender: DataTypes.ENUM("male", "female"),
    role: DataTypes.ENUM("influencer", "admin", "customer", "seller"),
    status: DataTypes.ENUM("active", "inactive", "suspended"),
    profile_picture: DataTypes.STRING,
    address: DataTypes.TEXT,
    business_address: DataTypes.TEXT,
    business_name: DataTypes.STRING,
    business_reg_no: DataTypes.STRING,
    business_description: DataTypes.TEXT,
    business_type: DataTypes.STRING,
    business_tax_id: DataTypes.STRING,
    business_contact_person: DataTypes.STRING,
    business_phone: DataTypes.STRING,
    business_website: DataTypes.STRING,
    country: DataTypes.STRING,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    postal_code: DataTypes.STRING,
    username: DataTypes.STRING,
    referral_code: DataTypes.STRING,
    is_email_verified: DataTypes.BOOLEAN,
    is_onboarding_completed: DataTypes.BOOLEAN,
    date_of_birth: DataTypes.DATE,
    bio: DataTypes.TEXT,
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  },
);

export default CoreUser;
