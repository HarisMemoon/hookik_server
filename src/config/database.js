// src/config/database.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Core Website Database
const coreDB = new Sequelize(process.env.CORE_DB_CONNECTION_STRING, {
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

// Admin Panel Database
const adminDB = new Sequelize(process.env.ADMIN_DB_CONNECTION_STRING, {
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

// Connect both databases
async function connectDatabases() {
  try {
    await coreDB.authenticate();
    console.log("CORE DB connected (hookik_dev)");

    await adminDB.authenticate();
    console.log("ADMIN DB connected (hookik_admin)");
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
}

export { coreDB, adminDB, connectDatabases };
