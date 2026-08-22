import { Router } from "express";

import {
  addToWishlist,
  removeFromWishlist,
  getMyWishlist,
} from "../controllers/wishlist.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/add", verifyJWT, addToWishlist);

router.delete("/remove", verifyJWT, removeFromWishlist);

router.get("/", verifyJWT, getMyWishlist);

export default router;
