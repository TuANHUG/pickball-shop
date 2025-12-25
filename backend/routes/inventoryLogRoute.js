import express from "express";
import {
  listInventoryLogs,
  createInventoryLog,
} from "../controllers/inventoryLogController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const inventoryLogRouter = express.Router();

inventoryLogRouter.get("/list", verifyAdmin, listInventoryLogs);
inventoryLogRouter.post("/create", verifyAdmin, createInventoryLog);

export default inventoryLogRouter;
