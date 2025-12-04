import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

// Place order using COD Method
const placeOrderCOD = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, phone, items, amount, address } = req.body;

        // Basic validation
        if (!name || !phone || !items || !Array.isArray(items) || items.length === 0 || !amount) {
            return res.status(400).json({ error: "Tất cả các trường là bắt buộc" });
        }
        const { street, ward, city} = address;
        if (!street || !city || !ward) {
            return res.status(400).json({ error: "Địa chỉ và thành phố là bắt buộc" });
        }

        // Validate each product exists
        for (let item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ error: `Không tìm thấy sản phẩm: ${item.name}` });
            }
        }

        // Create new order
        const newOrder = new Order({
            userId,
            name,
            phone,
            items,
            amount,
            address,
            status: "Pending",
            paymentMethod: "CashOnDelivery",
            payment: false
        });

        await newOrder.save();
        await User.findByIdAndUpdate(userId, { cartData: [] }, { new: true });

        return res.status(201).json({ success: true, message: "Đặt hàng thành công với phương thức thanh toán khi nhận hàng" });
    } catch (err) {
        console.error("Error placing COD order:", err);
        return res.status(500).json({ success: false, error: "Lỗi máy chủ" });
    }
};


// All orders data for Admin Panel
const allOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate("userId", "name email")
            .populate("items.productId", "image name");

        return res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching all orders:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

// User Order Data
const userOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find orders by user ID, sorted by most recent first
        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .populate("items.productId", "image");

        return res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};


// Update order status
const orderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        // Validate input
        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: "ID đơn hàng và trạng thái là bắt buộc" });
        }

        const allowedStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Giá trị trạng thái không hợp lệ" });
        }

        // Update the order
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        ).populate("userId", "name email");

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái đơn hàng thành công",
            order: updatedOrder,
        });

    } catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

// Update order payment status
const orderPayment = async (req, res) => {
    try {
        const { orderId, payment } = req.body;

        // Validate input
        if (!orderId || typeof payment !== 'boolean') {
            return res.status(400).json({ success: false, message: "ID đơn hàng và trạng thái thanh toán là bắt buộc" });
        }

        // Update the order payment status
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { payment },
            { new: true }
        ).populate("userId", "name email");

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái thanh toán thành công",
            order: updatedOrder,
        });

    } catch (error) {
        console.error("Error updating payment status:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};


export { placeOrderCOD, allOrders, userOrders, orderStatus, orderPayment };