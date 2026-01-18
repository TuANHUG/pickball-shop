import express from "express";
import {
  addReview,
  getProductReviews,
  getUserReview,
  updateReview,
  replyReview,
  deleteReply,
  hideReview,
} from "../controllers/reviewController.js";
import upload from "../middleware/multer.js";
import { verifyUser, verifyAdmin } from "../middleware/authMiddleware.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", verifyUser, upload.array("images", 4), addReview);
reviewRouter.put(
  "/update",
  verifyUser,
  upload.array("images", 4),
  updateReview
);
reviewRouter.put("/reply", verifyAdmin, replyReview);
reviewRouter.put("/reply/remove", verifyAdmin, deleteReply);
reviewRouter.put("/hide", verifyAdmin, hideReview);
reviewRouter.get("/user-review", verifyUser, getUserReview);
reviewRouter.get("/:productId", getProductReviews);

export default reviewRouter;
