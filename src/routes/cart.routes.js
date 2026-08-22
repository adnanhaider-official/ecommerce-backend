import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from "../controllers/cart.controller.js";

const router = Router();

router.post("/add", verifyJwt, addToCart);
router.get("/", verifyJwt, getCart);
router.patch("/update", verifyJwt, updateCartItem);
router.delete("/remove", verifyJwt, removeFromCart);
router.delete("/clear", verifyJwt, removeFromCart);

export default router;
