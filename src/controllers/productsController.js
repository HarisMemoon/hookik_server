import { Op } from "sequelize";
import ProductCategory from "../models/ProductCategory.js";
import Image from "../models/Image.js";
import Product from "../models/Product.js";
import CoreUser from "../models/CoreUser.js";
import { uploadToSpaces } from "../utils/uploadToSpaces.js";
import { logAction } from "../utils/logger.js";

export const getProductsList = async (req, res) => {
  try {
    const {
      filter = "all", // 'all', 'pending', 'rejected'
      page = 1,
      limit = 20,
      search = "",
      status, // 'verified', 'suspended', etc.
      category_id,
      brand_id,
      minPrice,
      maxPrice,
    } = req.query;

    const whereClause = {};

    // 1. Handle Pill Filters based on Schema Enum: 'pending','verified','unverified','suspended'
    if (filter === "pending") {
      whereClause.status = "pending";
    } else if (filter === "rejected") {
      whereClause.status = "suspended"; // Mapping rejected to suspended status
    }
    if (status && status !== "all") whereClause.status = status;

    // 2. Specific Entity Filters (IDs)
    if (category_id) whereClause.category_id = category_id;
    if (brand_id) whereClause.brand_id = brand_id;

    // 3. Price Range Logic (Op.gte = Greater than or equal, Op.lte = Less than or equal)
    if (minPrice || maxPrice) {
      whereClause.price = {
        ...(minPrice && { [Op.gte]: parseFloat(minPrice) }),
        ...(maxPrice && { [Op.lte]: parseFloat(maxPrice) }),
      };
    }
    // 2. Handle Status Dropdown from Filter Modal
    if (status) {
      whereClause.status = status;
    }

    // 3. Search by Product Name or SKU
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: CoreUser,
          as: "brandOwner",
          attributes: ["id", "first_name", "last_name"],
        },
        {
          model: Image,
          as: "images",
          attributes: ["id", "image_url"],
          where: { imageable_type: "product" },
          required: false,
        },
        {
          model: ProductCategory,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: ProductCategory,
          as: "subCategory",
          attributes: ["id", "name"],
        },
        {
          model: ProductCategory,
          as: "subSubCategory",
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: Number(limit),
      offset,
      distinct: true,
    });

    return res.json({
      products: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({ message: "Failed to fetch products" });
  }
};
export const updateProduct = async (req, res) => {
  try {
    console.log("=== BACKEND UPDATE PRODUCT ===");
    console.log("Request params ID:", req.params.id);
    console.log("Request body:", req.body);
    console.log("Request body keys:", Object.keys(req.body));

    const { id } = req.params;
    const { name, category_id, price, description, stock, sku, status } =
      req.body;
    const imageFile = req.file;

    console.log("Extracted values:", {
      name,
      category_id,
      price,
      description,
      stock,
      sku,
      status,
    });

    // ✅ Validate and sanitize price
    let sanitizedPrice = price;
    if (typeof price === "string") {
      sanitizedPrice = parseFloat(price.replace(/[₦$,\s]/g, ""));
    }

    if (isNaN(sanitizedPrice) || sanitizedPrice === undefined) {
      console.error("Invalid price:", price, "->", sanitizedPrice);
      return res.status(400).json({ message: "Invalid price format" });
    }

    const product = await Product.findByPk(id);

    if (!product) {
      console.error("Product not found:", id);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Updating product with:", {
      name,
      description,
      price: sanitizedPrice,
      sku,
      category_id,
      quantity: stock,
      status: status || product.status,
    });

    await product.update({
      name,
      description,
      price: sanitizedPrice,
      sku,
      category_id,
      quantity: stock,
      status: status || product.status,
    });
    let finalImageUrl = null;

    if (imageFile) {
      finalImageUrl = await uploadToSpaces(imageFile);
    }

    if (finalImageUrl) {
      const existingImage = await Image.findOne({
        where: {
          imageable_id: id,
          imageable_type: "product",
        },
      });

      if (existingImage) {
        await existingImage.update({ image_url: finalImageUrl });
      } else {
        await Image.create({
          image_url: finalImageUrl,
          imageable_id: id,
          imageable_type: "product",
        });
      }
    }
    await logAction(req.admin.id, "UPDATE_PRODUCT", "Product", product.id, {
      new_price: 5000,
    });

    return res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    console.error("Error stack:", error.stack); // ✅ Get full error
    return res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};
