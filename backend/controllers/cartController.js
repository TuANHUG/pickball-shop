import User from "../models/userModel.js";

// Utility function for input validation
const validateCartInput = ({ itemId, size, quantity = null }) => {
    if (!itemId || typeof itemId !== 'string') return "'itemId' không hợp lệ hoặc thiếu";
    if (!size || typeof size !== 'string') return "'size' không hợp lệ hoặc thiếu";
    if (quantity !== null) {
        if (typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity)) {
            return "'quantity' phải là số nguyên không âm";
        }
    }
    return null;
};

// Add product to cart (increments by 1)
const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId, size } = req.body;

        const error = validateCartInput({ itemId, size });
        if (error) return res.status(400).json({ success: false, message: error });

        // Atomic increment
        const updateResult = await User.findByIdAndUpdate(
            userId,
            { $inc: { [`cartData.${itemId}.${size}`]: 1 } },
            { new: true, upsert: false }
        );

        if (!updateResult) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }

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
        const { itemId, size, quantity } = req.body;

        const error = validateCartInput({ itemId, size, quantity });
        if (error) return res.status(400).json({ success: false, message: error });

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }

        let updateQuery = {};

        if (quantity === 0) {
            // Remove the size key
            updateQuery.$unset = { [`cartData.${itemId}.${size}`]: "" };

            // If it's the last size under the itemId, remove the itemId too
            const sizes = user.cartData?.[itemId];
            if (sizes && Object.keys(sizes).length === 1 && sizes[size] !== undefined) {
                updateQuery.$unset = { [`cartData.${itemId}`]: "" };
            }
        } else {
            // Set the quantity
            updateQuery.$set = { [`cartData.${itemId}.${size}`]: quantity };
        }

        await User.findByIdAndUpdate(userId, updateQuery, { new: true });

        res.status(200).json({ success: true, message: "Cập nhật giỏ hàng thành công" });
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
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }

        const cartData = userData.cartData || {};

        res.status(200).json({ success: true, cartData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { addToCart, updateCart, getUserCart };
