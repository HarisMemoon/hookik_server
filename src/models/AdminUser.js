// src/models/AdminUser.js
import { DataTypes } from "sequelize";
import { adminDB } from "../config/database.js";
import bcrypt from "bcryptjs";

const AdminUser = adminDB.define(
  "AdminUser",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("super_admin", "moderator", "support"),
      defaultValue: "moderator",
      allowNull: false,
    },
  },
  {
    tableName: "admin_users",
    hooks: {
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
    },
  }
);

AdminUser.prototype.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Create table in admin DB only
adminDB
  .sync()
  .then(() => console.log("AdminUser table synced"))
  .catch((err) => console.log("AdminUser sync error:", err));

export default AdminUser;
