import asyncHandler from "../utils/asyncHandler.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";

const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({
    user: req.user._id,
  }).populate("items.product");

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  if (cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const { shippingAddress } = req.body;

  if (!shippingAddress?.trim()) {
    throw new ApiError(400, "Shipping address is required");
  }

  // Check stock
  for (const item of cart.items) {
    if (item.quantity > item.product.stock) {
      throw new ApiError(400, `Insufficient stock for ${item.product.name}`);
    }
  }

  const totalAmount = cart.items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.product.price,
  }));

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount,
    shippingAddress,
  });

  // Decrease stock
  for (const item of cart.items) {
    item.product.stock -= item.quantity;
    await item.product.save();
  }

  cart.items = [];

  await cart.save();

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully"));
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
  }).populate("items.product");

  if (!orders.length) {
    throw new ApiError(404, "No orders found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const getSingleOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
  }).populate("items.product");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status !== "pending") {
    throw new ApiError(400, "Only pending orders can be cancelled");
  }

  order.status = "cancelled";

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled successfully"));
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "fullname email")
    .populate("items.product");

  if (!orders.length) {
    throw new ApiError(404, "No orders found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "All orders fetched successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const allowedStatuses = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid order status");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.status = status;

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

export {
  createOrder,
  getMyOrders,
  getSingleOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
