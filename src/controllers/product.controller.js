import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import uploadOnCloudinary from "../utils/Cloudinary.js";

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
    image: productImage.url,
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

  const skip = (page - 1) * limit;

  const products = await Product.find()
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  const totalProducts = await Product.countDocuments();

  const totalPages = Math.ceil(totalProducts / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        pagination: {
          currentPage: page,
          limit,
          totalPages,
          totalProducts,
        },
      },
      "Fetch All Products Successfully"
    )
  );
});

export { createProduct, getAllProducts };
