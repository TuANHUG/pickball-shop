import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/admin_assets/assets.js";

const Orders = () => {
    const currency = "$";
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all orders for admin
    const fetchAllOrders = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/order/list`, {
                withCredentials: true,
            });
            if (res.data.success) {
                setOrders(res.data.orders);
            } else {
                toast.error(res.data.message || "Không thể tải danh sách đơn hàng");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error(error.message || "Đã có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    // Handle order status update
    const statusHandler = async (newStatus, orderId) => {
        try {
            const res = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/order/status`,
                { orderId, status: newStatus },
                { withCredentials: true }
            );

            if (res.data.success) {
                // Update order status in state
                setOrders((prev) =>
                    prev.map((order) =>
                        order._id === orderId ? { ...order, status: newStatus } : order
                    )
                );
                toast.success("Cập nhật trạng thái đơn hàng thành công");
            } else {
                toast.error(res.data.message || "Không thể cập nhật trạng thái đơn hàng");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Đã có lỗi xảy ra khi cập nhật trạng thái đơn hàng");
        }
    };

    // Handle payment status update
    const paymentHandler = async (orderId, currentPayment) => {
        try {
            const res = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/order/payment`,
                { orderId, payment: !currentPayment },
                { withCredentials: true }
            );

            if (res.data.success) {
                // Update payment status in state
                setOrders((prev) =>
                    prev.map((order) =>
                        order._id === orderId ? { ...order, payment: !currentPayment } : order
                    )
                );
                toast.success("Cập nhật trạng thái thanh toán thành công");
            } else {
                toast.error(res.data.message || "Không thể cập nhật trạng thái thanh toán");
            }
        } catch (error) {
            console.error("Error updating payment:", error);
            toast.error("Đã có lỗi xảy ra khi cập nhật trạng thái thanh toán");
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    if (loading) return <p className="p-4 text-center text-gray-500">Đang tải đơn hàng...</p>;
    if (!orders.length) return <p className="p-4 text-center text-gray-500">Không có đơn hàng nào</p>;

    return (
        <div className="p-4">
            <h3 className="text-xl font-semibold mb-4">Đơn hàng</h3>
            <div>
                {orders.map((order) => (
                    <article
                        key={order._id}
                        className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 text-xs sm:text-sm text-gray-700 rounded-md"
                    >
                        <img className="w-12" src={assets.parcel_icon} alt="Parcel Icon" />

                        <div>
                            <div>
                                {order.items.map((item, index) => (
                                    <p className="p-0.5" key={index}>
                                        {item.name} x {item.quantity}
                                        {item.size && <span> - Size: {item.size}</span>}
                                        {item.color && <span> - Color: {item.color}</span>}
                                        {index !== order.items.length - 1 && ","}
                                    </p>
                                ))}
                            </div>
                            <p className="mt-3 mb-2 font-medium">{order.name}</p>
                            <address className="not-italic">
                                <p>{order.address.street}</p>
                                <p>
                                    {order.address.ward && `${order.address.ward}, `}
                                    {order.address.city}
                                </p>
                            </address>
                            <p>{order.phone}</p>
                        </div>

                        <div>
                            <p className="text-sm sm:text-base">Số lượng: {order.items.length}</p>
                            <p className="mt-3">Phương thức: {order.paymentMethod === "CashOnDelivery" ? "Thanh toán khi nhận hàng" : order.paymentMethod}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <span>Thanh toán:</span>
                                <button
                                    onClick={() => paymentHandler(order._id, order.payment)}
                                    className={`px-3 py-1 rounded text-xs font-semibold ${
                                        order.payment 
                                            ? 'bg-green-100 text-green-700 border border-green-300' 
                                            : 'bg-red-100 text-red-700 border border-red-300'
                                    }`}
                                >
                                    {order.payment ? "Đã thanh toán" : "Chưa thanh toán"}
                                </button>
                            </div>
                            <p>Ngày đặt hàng: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>

                        <div>
                            <p className="text-sm sm:text-base">
                                {currency} {order.amount}
                            </p>
                        </div>

                        <div>
                            <select
                                value={order.status}
                                onChange={(e) => statusHandler(e.target.value, order._id)}
                                className="p-2 font-semibold border border-gray-300 rounded-md"
                            >
                                <option value="Pending">Chờ xử lý</option>
                                <option value="Processing">Đang xử lý</option>
                                <option value="Shipped">Đã gửi hàng</option>
                                <option value="Delivered">Đã giao hàng</option>
                                <option value="Cancelled">Đã hủy</option>
                            </select>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default Orders;
