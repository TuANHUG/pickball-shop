import User from "../models/userModel.js";

// Utility function for input validation
const validateCartInput = ({ itemId, size, color, quantity = null }) => {
  if (!itemId || typeof itemId !== "string")
    return "'itemId' không hợp lệ hoặc thiếu";

  // Size and color can be empty strings, but must be present
  if (size === undefined || size === null)
    return "'size' không hợp lệ hoặc thiếu";
  if (color === undefined || color === null)
    return "'color' không hợp lệ hoặc thiếu";

  if (quantity !== null) {
    if (
      typeof quantity !== "number" ||
      quantity < 0 ||
      !Number.isInteger(quantity)
    ) {
      return "'quantity' phải là số nguyên không âm";
    }
  }
  return null;
};

// Add product to cart (increments by 1)
const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId, size, color } = req.body;

    const error = validateCartInput({ itemId, size, color });
    if (error) return res.status(400).json({ success: false, message: error });

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    // Initialize cartData as array if not exists
    if (!Array.isArray(user.cartData)) {
      user.cartData = [];
    }

    // Find existing item with same productId, size, and color
    const existingItemIndex = user.cartData.findIndex(
      (item) =>
        item.productId === itemId && item.size === size && item.color === color
    );

    if (existingItemIndex > -1) {
      // Increment quantity
      user.cartData[existingItemIndex].quantity += 1;
    } else {
      // Add new item
      user.cartData.push({
        productId: itemId,
        size,
        color,
        quantity: 1,
      });
    }

    user.markModified('cartData');
    await user.save();

    res.status(200).json({ success: true, message: "Đã thêm vào giỏ hàng" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update cart (set quantity or remove)
const updateCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId, size, color, quantity } = req.body;

    const error = validateCartInput({ itemId, size, color, quantity });
    if (error) return res.status(400).json({ success: false, message: error });

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    // Initialize cartData as array if not exists
    if (!Array.isArray(user.cartData)) {
      user.cartData = [];
    }

    // Find existing item
    const existingItemIndex = user.cartData.findIndex(
      (item) =>
        item.productId === itemId && item.size === size && item.color === color
    );

    if (quantity === 0) {
      // Remove item from cart
      if (existingItemIndex > -1) {
        user.cartData.splice(existingItemIndex, 1);
      }
    } else {
      // Update or add item
      if (existingItemIndex > -1) {
        user.cartData[existingItemIndex].quantity = quantity;
      } else {
        user.cartData.push({
          productId: itemId,
          size,
          color,
          quantity,
        });
      }
    }

    user.markModified('cartData');
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Cập nhật giỏ hàng thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user cart
const getUserCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const userData = await User.findById(userId).lean();
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const cartData = userData.cartData || [];

    res.status(200).json({ success: true, cartData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart };
