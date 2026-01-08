import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: { type: String, required: true },
    reply: {
      comment: { type: String }, // Nội dung shop trả lời
      createdAt: { type: Date }, // Ngày shop trả lời
    },
    images: [
      {
        url: { type: String },
        public_id: { type: String },
      },
    ],
  },
  { timestamps: true }
);

reviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
