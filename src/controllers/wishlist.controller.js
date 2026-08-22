import asyncHandler from "../utils/asyncHandler.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import { Wishlist } from "../models/wishlist.model.js";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Product id is invalid");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  let wishlist = await Wishlist.findOne({
    user: req.user._id,
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: [productId],
    });

    return res
      .status(201)
      .json(new ApiResponse(201, wishlist, "Product added to wishlist"));
  }

  const existingItem = wishlist.products.find(
    (item) => item.toString() === productId
  );

  if (existingItem) {
    throw new ApiError(400, "Product already in wishlist");
  }

  wishlist.products.push(productId);

  await wishlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, wishlist, "Product added to wishlist"));
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Product id is invalid");
  }

  const wishlist = await Wishlist.findOne({
    user: req.user._id,
  });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  const existingItem = wishlist.products.find(
    (item) => item.toString() === productId
  );

  if (!existingItem) {
    throw new ApiError(404, "Product not found in wishlist");
  }

  wishlist.products = wishlist.products.filter(
    (item) => item.toString() !== productId
  );

  await wishlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, wishlist, "Product removed from wishlist"));
});

const getMyWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({
    user: req.user._id,
  }).populate("products");

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, wishlist, "Wishlist fetched successfully"));
});

export { addToWishlist, removeFromWishlist, getMyWishlist };
