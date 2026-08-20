import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Category } from "../models/category.model.js";

// Create Categories
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, "Category name is required");
  }

  const existingCategory = await Category.findOne({ name });

  if (existingCategory) {
    throw new ApiError(409, "Category already exists");
  }

  const category = await Category.create({
    name,
    description: description || "",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, category, "Category Created Successfully"));
});

// Get All Categories
const getAllCategory = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });

  if (!categories) {
    throw new ApiError(404, "Categories not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, categories, "Fetch All Categories Successfully")
    );
});

export { createCategory, getAllCategory };
