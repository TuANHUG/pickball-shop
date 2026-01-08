import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  status: { type: String, default: "active", enum: ["active", "inactive"] },
  image: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
  ],
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
      required: true,
    },
  ],
  ratingsAverage: { type: Number, default: 0 }, // Sao trung bình (vd: 4.5)
  ratingsQuantity: { type: Number, default: 0 }, // Tổng số lượt đánh giá
  date: { type: Date, default: Date.now },
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
