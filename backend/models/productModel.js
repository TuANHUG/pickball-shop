import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
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
  date: { type: Date, default: Date.now },
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
