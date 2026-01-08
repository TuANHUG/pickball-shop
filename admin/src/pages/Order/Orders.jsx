import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation } from 'react-router';

const Orders = () => {
    const currency = "$";
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const userIdFromUrl = queryParams.get("userId");
    
    // Filter & Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    const [statusFilter, setStatusFilter] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
     const [userId, setUserId] = useState(userIdFromUrl || "");


    // Fetch all orders for admin
    const fetchAllOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                status: statusFilter,
                payment: paymentFilter,
                startDate,
                endDate,
                sortBy,
                sortOrder,
                userId: userId
            };
            
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/order/list`, {
                params,
                withCredentials: true,
            });
            if (res.data.success) {
                setOrders(res.data.orders);
                setTotalPages(res.data.totalPages);
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

    useEffect(() => {
        fetchAllOrders();
    }, [page, statusFilter, paymentFilter, startDate, endDate, sortBy, sortOrder, userId]);

    useEffect(() => {
        setUserId(userIdFromUrl || "");
    }, [userIdFromUrl]);


    // Handle sort
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
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

    return (
        <div className="p-4">
            <h3 className="text-xl font-semibold mb-4">Đơn hàng</h3>
            
            {/* Filters */}
            <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 mb-4 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Trạng thái đơn</label>
                    <select 
                        value={statusFilter} 
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">Tất cả</option>
                        <option value="Pending">Chờ xử lý</option>
                        <option value="Processing">Đang đóng gói</option>
                        <option value="Shipped">Đang giao hàng</option>
                        <option value="Delivered">Đã giao hàng</option>
                        <option value="Cancelled">Đã hủy</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Thanh toán</label>
                    <select 
                        value={paymentFilter} 
                        onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
                        className="p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">Tất cả</option>
                        <option value="true">Đã thanh toán</option>
                        <option value="false">Chưa thanh toán</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Từ ngày</label>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                        className="p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Đến ngày</label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                        className="p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                
                <button 
                    onClick={() => {
                        setStatusFilter("");
                        setPaymentFilter("");
                        setStartDate("");
                        setEndDate("");
                        setPage(1);
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                    Xóa bộ lọc
                </button>
            </div>

            {loading ? (
                <p className="p-4 text-center text-gray-500">Đang tải đơn hàng...</p>
            ) : !orders.length ? (
                <p className="p-4 text-center text-gray-500">Không có đơn hàng nào</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 text-sm">
                            <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Sản phẩm</th>
                                    <th 
                                        className="py-3 px-4 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                                        onClick={() => handleSort('amount')}
                                    >
                                        Tổng tiền {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Địa chỉ & Người nhận</th>
                                    <th 
                                        className="py-3 px-4 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                                        onClick={() => handleSort('createdAt')}
                                    >
                                        Ngày đặt {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Thanh toán</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-700">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 align-top">
                                            <div className="flex flex-col gap-1">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="text-gray-700">
                                                        <span className="font-medium">{item.name}</span>
                                                        <span className="text-gray-500 text-xs ml-1">
                                                            x{item.quantity}
                                                            {item.size && ` | Size: ${item.size}`}
                                                            {item.color && ` | Color: ${item.color}`}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 align-top font-medium">
                                            {currency} {order.amount}
                                        </td>
                                        <td className="py-3 px-4 align-top">
                                            <p className="font-medium text-gray-800">{order.name}</p>
                                            <p className="text-gray-600 text-xs mt-1">
                                                {order.address.street}
                                            </p>
                                            <p className="text-gray-600 text-xs">
                                                {order.address.ward ? `${order.address.ward}, ` : ''}{order.address.city}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-1">{order.phone}</p>
                                        </td>
                                        <td className="py-3 px-4 align-top">
                                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            <br/>
                                            <span className="text-xs text-gray-500">
                                                {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 align-top">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span className="text-xs text-gray-500">
                                                    {order.paymentMethod === "CashOnDelivery" ? "COD" : order.paymentMethod}
                                                </span>
                                                <button
                                                    onClick={() => paymentHandler(order._id, order.payment)}
                                                    className={`px-3 py-1 rounded text-xs font-semibold border transition-colors ${
                                                        order.payment 
                                                            ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' 
                                                            : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                                                    }`}
                                                >
                                                    {order.payment ? "Đã thanh toán" : "Chưa thanh toán"}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 align-top">
                                            <select
                                                value={order.status}
                                                onChange={(e) => statusHandler(e.target.value, order._id)}
                                                className="p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="Pending">Chờ xử lý</option>
                                                <option value="Processing">Đang đóng gói</option>
                                                <option value="Shipped">Đang giao hàng</option>
                                                <option value="Delivered">Đã giao hàng</option>
                                                <option value="Cancelled">Đã hủy</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center mt-6 gap-2">
                        <button
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Trước
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`px-3 py-1 border rounded ${
                                    p === page ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-100'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages}
                            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sau
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Orders;
