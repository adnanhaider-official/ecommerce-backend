import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/Cloudinary.js";
import mongoose from "mongoose";

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category, brand } = req.body;

  if (
    !name?.trim() ||
    !description?.trim() ||
    price === undefined ||
    price === null ||
    !category
  ) {
    throw new ApiError(400, "All Fields are required");
  }

  const existingCategory = await Category.findById(category);

  if (!existingCategory) {
    throw new ApiError(404, "Category not found");
  }

  const productImageLocalPath = req.file?.path;

  if (!productImageLocalPath) {
    throw new ApiError(400, "Product image is required");
  }

  const productImage = await uploadOnCloudinary(productImageLocalPath);

  if (!productImage) {
    throw new ApiError(500, "Product image upload failed");
  }

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category,
    image: {
      url: productImage.url,
      public_id: productImage.public_id,
    },
    brand: brand?.trim() || "",
    isActive: true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created Successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  // Pagination validation
  if (page < 1) {
    throw new ApiError(400, "Page must be at least 1");
  }

  if (limit < 1) {
    throw new ApiError(400, "Limit must be at least 1");
  }

  if (limit > 100) {
    throw new ApiError(400, "Limit cannot be greater than 100");
  }

  const skip = (page - 1) * limit;

  const search = req.query.search;
  const category = req.query.category;
  const minPrice = Number(req.query.minPrice);
  const maxPrice = Number(req.query.maxPrice);
  const brand = req.query.brand;
  const sort = req.query.sort || "name_asc";

  const filter = {};
  let sortOptions = {};

  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  if (category) {
    if (!mongoose.isValidObjectId(category)) {
      throw new ApiError(400, "Invalid category ID");
    }

    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      throw new ApiError(404, "Category not found");
    }
    filter.category = category;
  }

  if (!isNaN(minPrice)) {
    filter.price = {
      $gte: minPrice,
    };
  }

  if (!isNaN(maxPrice)) {
    filter.price = {
      ...filter.price,
      $lte: maxPrice,
    };
  }

  if (brand) {
    filter.brand = {
      $regex: brand,
      $options: "i",
    };
  }

  // Sort validation
  if (
    sort !== "name_asc" &&
    sort !== "name_desc" &&
    sort !== "price_asc" &&
    sort !== "price_desc"
  ) {
    throw new ApiError(400, "Invalid sort option");
  }

  if (sort === "name_asc") {
    sortOptions = {
      name: 1,
    };
  }

  if (sort === "name_desc") {
    sortOptions = {
      name: -1,
    };
  }

  if (sort === "price_asc") {
    sortOptions = {
      price: 1,
    };
  }

  if (sort === "price_desc") {
    sortOptions = {
      price: -1,
    };
  }

  const totalProducts = await Product.countDocuments(filter);

  const totalPages = Math.ceil(totalProducts / limit);

  if (page > totalPages && totalPages > 0) {
    throw new ApiError(404, "Page not found");
  }

  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  const products = await Product.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
          totalProducts,
          hasNextPage,
          hasPreviousPage,
        },
      },
      "Fetch All Products Successfully"
    )
  );
});

const getSingleProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Fetch Single Product Successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { name, description, price, stock, category, brand } = req.body;

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Category update
  if (category) {
    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      throw new ApiError(404, "Category not found");
    }

    product.category = category;
  }

  // Other fields update
  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price ?? product.price;
  product.stock = stock ?? product.stock;
  product.brand = brand || product.brand;

  // Image update
  const productImageLocalPath = req.file?.path;

  if (productImageLocalPath) {
    const oldPublicId = product.image.public_id;

    const productImage = await uploadOnCloudinary(productImageLocalPath);

    if (!productImage) {
      throw new ApiError(500, "Product image upload failed");
    }

    await deleteFromCloudinary(oldPublicId);

    product.image = {
      url: productImage.url,
      public_id: productImage.public_id,
    };
  }

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const publicId = product.image.public_id;

  await deleteFromCloudinary(publicId);

  await product.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Product deleted successfully"));
});

export {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
