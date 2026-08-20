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
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const categories = await Category.find()
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  const totalCategories = await Category.countDocuments();

  const totalPages = Math.ceil(totalCategories / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        categories,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
          totalCategories,
        },
      },
      "Fetch All Categories Successfully"
    )
  );
});

// Category Update API
// const updateCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   const category = await Category.findByIdAndUpdate(id, req.body, {
//     new: true,
//   });

//   if (!category) {
//     throw new ApiError(404, "Category not found");
//   }
//   return res
//     .status(200)
//     .json(new ApiResponse(200, category, "Category Updated Successfully"));
// });

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (name !== undefined) {
    category.name = name;
  }

  if (description !== undefined) {
    category.description = description;
  }

  await category.save();

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category Updated Successfully"));
});

// delete Category
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  //   const category = await findByIdAndDelete(id);
  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  await category.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category delete Successfully"));
});

export { createCategory, getAllCategory, updateCategory, deleteCategory };
