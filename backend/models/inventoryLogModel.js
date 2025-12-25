import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["IMPORT", "EXPORT"],
    required: true,
    description: "Phân loại: IMPORT (Nhập), EXPORT (Xuất)",
  },
  items: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 0,
        description: "Số lượng thay đổi (luôn để số dương)",
      },
    },
  ],
  created_by: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
    description: "Thời điểm ghi log",
  },
});

const InventoryLog =
  mongoose.models.InventoryLog ||
  mongoose.model("InventoryLog", inventoryLogSchema);

export default InventoryLog;
