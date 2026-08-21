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

export { addToCart };
