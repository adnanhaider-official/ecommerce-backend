import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import { Cart } from "../models/cart.model.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  // 1. Validate productId
  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  // 2. Validate quantity
  if (!quantity || quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  // 3. Check product exists
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 4. Find user's cart
  let cart = await Cart.findOne({
    user: req.user._id,
  });

  // 5. Cart doesn't exist → create new cart
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [
        {
          product: productId,
          quantity,
        },
      ],
    });

    return res
      .status(201)
      .json(new ApiResponse(201, cart, "Product added to cart"));
  }

  // 6. Check product already exists in cart
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  // 7. Product already exists → increase quantity
  if (existingItem) {
    existingItem.quantity += quantity;

    await cart.save();

    return res
      .status(200)
      .json(new ApiResponse(200, cart, "Product quantity updated in cart"));
  }

  // 8. Product doesn't exist → add new item
  cart.items.push({
    product: productId,
    quantity,
  });

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Product added to cart"));
});

const getCart = asyncHandler(async (req, res) => {
  // Get logged-in user's cart with populated product details
  const cart = await Cart.findOne({
    user: req.user._id,
  }).populate("items.product");

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  if (!quantity || quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  const cart = await Cart.findOne({
    user: req.user._id,
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = cart.items.find((item) => item.product.toString() === productId);

  if (!item) {
    throw new ApiError(404, "Product not found in cart");
  }

  item.quantity = quantity;

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart item updated successfully"));
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  // 1. Validate productId
  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  // 2. Find user's cart
  const cart = await Cart.findOne({
    user: req.user._id,
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  // 3. Check product exists in cart
  const itemExists = cart.items.some(
    (item) => item.product.toString() === productId
  );

  if (!itemExists) {
    throw new ApiError(404, "Product not found in cart");
  }

  // 4. Remove product from cart
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  // 5. Save updated cart
  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Product removed from cart successfully"));
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({
    user: req.user._id,
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = [];

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart cleared successfully"));
});

export { addToCart, getCart, updateCartItem, removeFromCart, clearCart };
