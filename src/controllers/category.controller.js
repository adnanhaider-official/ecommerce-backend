import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Category } from "../models/category.model.js";

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

export { createCategory };
