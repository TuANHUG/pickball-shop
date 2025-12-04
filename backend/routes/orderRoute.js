import express from "express";
import { verifyAdmin, verifyUser } from "../middleware/authMiddleware.js";
import {
  allOrders,
  orderStatus,
  orderPayment,
  placeOrderCOD,
  userOrders,
} from "../controllers/orderController.js";

const orderRoute = express.Router();

// Admin feature
orderRoute.get("/list", verifyAdmin, allOrders);
orderRoute.put("/status", verifyAdmin, orderStatus);
orderRoute.put("/payment", verifyAdmin, orderPayment);

// Payment feature
orderRoute.post("/place-cod", verifyUser, placeOrderCOD);

// User feature
orderRoute.get("/userOrders", verifyUser, userOrders);

export default orderRoute;
