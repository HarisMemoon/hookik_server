// src/models/associations.js
import CoreUser from "./CoreUser.js";
import Storefront from "./Storefront.js";
import Order from "./Order.js";
import Transaction from "./Transaction.js";
import Product from "./Product.js";
import ProductCategory from "./ProductCategory.js";
import Collection from "./Collection.js";
import Wallet from "./Wallet.js";

let associationsSetup = false;

export function setupAssociations() {
  if (associationsSetup) {
    console.log("⚠️ Associations already set up, skipping...");
    return;
  }

  console.log("🔗 Setting up model associations...");

  // ============================================
  // USER ASSOCIATIONS (CoreUser)
  // ============================================

  // User has many storefronts
  CoreUser.hasMany(Storefront, {
    foreignKey: "user_id",
    as: "storefronts",
  });

  // User has many orders
  CoreUser.hasMany(Order, {
    foreignKey: "user_id",
    as: "orders",
  });

  // User has many transactions
  CoreUser.hasMany(Transaction, {
    foreignKey: "user_id",
    as: "transactions",
  });

  // User has many products (as brand owner)
  CoreUser.hasMany(Product, {
    foreignKey: "brand_id",
    as: "products",
  });

  // User has many collections
  CoreUser.hasMany(Collection, {
    foreignKey: "user_id",
    as: "collections",
  });

  // User has one wallet
  CoreUser.hasOne(Wallet, {
    foreignKey: "user_id",
    as: "wallet",
  });

  // ============================================
  // STOREFRONT ASSOCIATIONS
  // ============================================

  Storefront.belongsTo(CoreUser, {
    foreignKey: "user_id",
    as: "owner",
  });

  // ============================================
  // ORDER ASSOCIATIONS
  // ============================================

  Order.belongsTo(CoreUser, {
    foreignKey: "user_id",
    as: "buyer",
  });

  // ============================================
  // TRANSACTION ASSOCIATIONS
  // ============================================

  // Transaction.belongsTo(CoreUser, {
  //   foreignKey: "user_id",
  //   as: "User", // Capital U to match your queries in dashboard
  // });

  Transaction.belongsTo(CoreUser, {
    foreignKey: "user_id",
    as: "owner", // Alternative alias for other queries
  });

  // ============================================
  // PRODUCT ASSOCIATIONS
  // ============================================

  Product.belongsTo(CoreUser, {
    foreignKey: "brand_id",
    as: "brandOwner",
  });

  Product.belongsTo(ProductCategory, {
    foreignKey: "category_id",
    as: "category",
  });

  Product.belongsTo(ProductCategory, {
    foreignKey: "sub_category_id",
    as: "subCategory",
  });

  Product.belongsTo(ProductCategory, {
    foreignKey: "sub_sub_category_id",
    as: "subSubCategory",
  });

  // ============================================
  // PRODUCT CATEGORY ASSOCIATIONS (Self-referencing)
  // ============================================

  ProductCategory.belongsTo(ProductCategory, {
    foreignKey: "parent_id",
    as: "parentCategory",
  });

  ProductCategory.hasMany(ProductCategory, {
    foreignKey: "parent_id",
    as: "subCategories",
  });

  // ============================================
  // COLLECTION ASSOCIATIONS
  // ============================================

  Collection.belongsTo(CoreUser, {
    foreignKey: "user_id",
    as: "owner",
  });

  Collection.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product",
  });

  // ============================================
  // WALLET ASSOCIATIONS
  // ============================================

  Wallet.belongsTo(CoreUser, {
    foreignKey: "user_id",
    as: "user",
  });

  associationsSetup = true;
  console.log("✅ Model associations set up successfully");
}
