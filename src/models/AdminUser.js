import { DataTypes } from "sequelize";
import { adminDB } from "../config/database.js";
import bcrypt from "bcryptjs";

const AdminUser = adminDB.define(
  "AdminUser",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    first_name: { type: DataTypes.STRING, field: "first_name" },
    last_name: { type: DataTypes.STRING, field: "last_name" },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("super_admin", "moderator", "support"),
      defaultValue: "moderator",
    },
    permissions: { type: DataTypes.JSON },
    duration: { type: DataTypes.STRING, defaultValue: "Permanent" },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
    },
    // Map this to your specific date_created column
    dateCreated: {
      type: DataTypes.DATE,
      field: "date_created",
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "admin_users",
    timestamps: true, // This handles created_at and updated_at
    underscored: true, // This forces Sequelize to use created_at instead of createdAt
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  },
);

AdminUser.prototype.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

adminDB
  .sync({ alter: true }) // automatically updates table
  .then(() => console.log("AdminUser table synced"))
  .catch((err) => console.log("AdminUser sync error:", err));

export default AdminUser;
