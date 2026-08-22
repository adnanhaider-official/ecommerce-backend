import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

import ApiResponse from "../utils/ApiResponse.js";

import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";

const addReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  // 1. Product ID validation
  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  // 2. Rating validation
  if (!rating) {
    throw new ApiError(400, "Rating is required");
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  // 3. Comment validation
  if (!comment?.trim()) {
    throw new ApiError(400, "Comment is required");
  }

  // 4. Check product exists
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 5. Check user already reviewed this product
  const existingReview = await Review.findOne({
    user: req.user._id,
    product: productId,
  });

  if (existingReview) {
    throw new ApiError(400, "You have already reviewed this product");
  }

  // 6. Create review
  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    comment,
  });

  // 7. Response
  return res
    .status(201)
    .json(new ApiResponse(201, review, "Review added successfully"));
});

const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // 1. Validate product ID
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  // 2. Check product exists
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 3. Get reviews
  const reviews = await Review.find({
    product: productId,
  })
    .populate("user", "fullname")
    .sort({ createdAt: -1 });

  // 4. Response
  return res
    .status(200)
    .json(
      new ApiResponse(200, reviews, "Product reviews fetched successfully")
    );
});

const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  // 1. Validate review ID
  if (!mongoose.isValidObjectId(reviewId)) {
    throw new ApiError(400, "Invalid review ID");
  }

  // 2. Validate rating
  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5");
    }
  }

  // 3. Validate comment
  if (comment !== undefined && !comment.trim()) {
    throw new ApiError(400, "Comment cannot be empty");
  }

  // 4. Find user's review
  const review = await Review.findOne({
    _id: reviewId,
    user: req.user._id,
  });

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // 5. Update fields
  if (rating !== undefined) {
    review.rating = rating;
  }

  if (comment !== undefined) {
    review.comment = comment;
  }

  // 6. Save
  await review.save();

  // 7. Response
  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review updated successfully"));
});

const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  // 1. Validate review ID
  if (!mongoose.isValidObjectId(reviewId)) {
    throw new ApiError(400, "Invalid review ID");
  }

  // 2. Find user's review
  const review = await Review.findOne({
    _id: reviewId,
    user: req.user._id,
  });

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // 3. Delete review
  await Review.findByIdAndDelete(reviewId);

  // 4. Response
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Review deleted successfully"));
});

const getProductRating = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // 1. Validate product ID
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  // 2. Check product exists
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // 3. Calculate average rating
  const result = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
      },
    },
    {
      $group: {
        _id: "$product",

        averageRating: {
          $avg: "$rating",
        },

        totalReviews: {
          $sum: 1,
        },
      },
    },
  ]);

  // 4. No reviews
  const rating = result[0] || {
    averageRating: 0,
    totalReviews: 0,
  };

  // 5. Response
  return res
    .status(200)
    .json(new ApiResponse(200, rating, "Product rating fetched successfully"));
});

export {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getProductRating,
};
