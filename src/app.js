// src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDatabases } from "./config/database.js";
import { verifyAdmin } from "./middleware/auth.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.js";
import userRoutes from "./routes/user.routes.js";
import storefrontRoutes from "./routes/storefront.routes.js";
import productRoutes from "./routes/products.route.js";
import orderRoutes from "./routes/order.routes.js";
import payoutRoutes from "./routes/payout.routes.js";
import productCategoryRoutes from "./routes/product_categories.routes.js";
import statsRoutes from "./routes/statsRoutes.routes.js";
import { setupAssociations } from "./models/associations.js";

setupAssociations();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9292;

app.use(cors());
app.use(express.json());

// Public health check route
app.get("/", (req, res) => {
  res.send("Hookik Admin Backend is running");
});

// 1. PUBLIC ROUTES (Authentication)
app.use("/api/admin/auth", authRoutes);

// --- 2. PROTECTED ROUTES GROUP ---
// Apply admin verification middleware to all routes below
app.use("/api/admin", verifyAdmin);

// Protected Dashboard Routes (e.g., /api/admin/dashboard)
app.use("/api/admin/dashboard", dashboardRoutes);

// Protected User Management Routes (e.g., /api/admin/users)

app.use("/api/admin", userRoutes);
app.use("/api/admin", storefrontRoutes);
app.use("/api/admin", productRoutes);
app.use("/api/admin", orderRoutes);
app.use("/api/admin", payoutRoutes);
app.use("/api/admin", productCategoryRoutes);
app.use("/api/admin", statsRoutes);

// Start server AFTER databases connect
connectDatabases()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Admin Backend running at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Server startup failed due to DB error", err);
  });
