import { Router } from "express";

import {
  addReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getProductRating,
} from "../controllers/review.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Add review
router.post("/", verifyJWT, addReview);

// Get product reviews
router.get("/product/:productId", getProductReviews);

// Get product rating
router.get("/product/:productId/rating", getProductRating);

// Update review
router.patch("/:reviewId", verifyJWT, updateReview);

// Delete review
router.delete("/:reviewId", verifyJWT, deleteReview);

export default router;
