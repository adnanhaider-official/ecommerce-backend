import { Router } from "express";

import {
  createOrder,
  getMyOrders,
  getSingleOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

import { verifyJWT, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// User routes
router.post("/", verifyJWT, createOrder);

router.get("/my-orders", verifyJWT, getMyOrders);

router.get("/:orderId", verifyJWT, getSingleOrder);

router.patch("/:orderId/cancel", verifyJWT, cancelOrder);

// Admin routes
router.get("/admin/all", verifyJWT, isAdmin, getAllOrders);

router.patch("/admin/:orderId/status", verifyJWT, isAdmin, updateOrderStatus);

export default router;
