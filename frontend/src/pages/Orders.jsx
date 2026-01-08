import React, { useCallback, useEffect, useState } from 'react';
import { useShop } from '../context/ShopContex';
import { useAuth } from '../context/AuthContext';
import Title from '../components/Title';
import { toast } from 'react-toastify';
import ReviewPopup from '../components/ReviewPopup';
import axios from 'axios';

function Orders() {
    const { backendUrl, currency } = useShop();
    const { user } = useAuth();
    const [orderData, setOrderData] = useState([]);
    const [statusFilter, setStatusFilter] = useState('Delivered');
    
    // Popup state
    const [showReviewPopup, setShowReviewPopup] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reviewInitialData, setReviewInitialData] = useState(null);

    const tabs = [
        { id: 'Pending', label: 'Chờ xử lý' },
        { id: 'Processing', label: 'Đang đóng gói' },
        { id: 'Shipped', label: 'Đang giao hàng' },
        { id: 'Delivered', label: 'Đã giao hàng' },
        { id: 'Cancelled', label: 'Đã hủy' },
    ];

    const loadOrderData = useCallback(async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/order/userOrders`, { withCredentials: true });
            if (res.data.success) {
                let allOrdersItem = [];
                res.data.orders.forEach((order) => {
                    order.items.forEach((item) => {
                        item.status = order.status;
                        item.payment = order.payment;
                        item.paymentMethod = order.paymentMethod;
                        item.date = order.createdAt;
                        item.orderId = order._id;
                        allOrdersItem.push(item);
                    });
                });
                setOrderData(allOrdersItem.reverse());
            } else {
                console.log(res.data.message);
            }
        } catch (error) {
            console.error("Error loading order data:", error);
        }
    }, [backendUrl]);

    const getStatusText = (status) => {
        switch(status) {
            case 'Pending': return 'Chờ xử lý';
            case 'Processing': return 'Đang đóng gói';
            case 'Shipped': return 'Đang giao hàng';
            case 'Delivered': return 'Đã giao hàng';
            case 'Cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    useEffect(() => {
        if (user) {
            loadOrderData();
        }
    }, [user, loadOrderData]);

    const handleReviewClick = (product) => {
        setSelectedProduct({
            ...product,
            image: product.productId?.image?.[0]?.url || '/no-image.jpg'
        });
        setReviewInitialData(null);
        setShowReviewPopup(true);
    };

    const handleEditReview = async (product) => {
        try {
            const res = await axios.get(`${backendUrl}/api/review/user-review`, {
                params: {
                    productId: product.productId._id,
                    orderId: product.orderId
                },
                withCredentials: true 
            });
            if (res.data.success) {
                setSelectedProduct({
                    ...product,
                    image: product.productId?.image?.[0]?.url || '/no-image.jpg'
                });
                setReviewInitialData(res.data.review);
                setShowReviewPopup(true);
            }
        } catch (error) {
             console.error(error);
             toast.error('Không thể tải đánh giá cũ');
        }
    };

    const handleSubmitReview = async (reviewData) => {
        try {
            const formData = new FormData();
            formData.append('productId', reviewData.productId);
            formData.append('orderId', reviewData.orderId);
            formData.append('rating', reviewData.rating);
            formData.append('comment', reviewData.comment);
            
            // Handle updates
            if (reviewData.reviewId) {
                formData.append('reviewId', reviewData.reviewId);
                // Send kept images as JSON string
                formData.append('keptImages', JSON.stringify(reviewData.keptImages));
                
                // New files
                if (reviewData.newImages && reviewData.newImages.length > 0) {
                     reviewData.newImages.forEach((image) => {
                         formData.append('images', image);
                     });
                }
                
                const res = await axios.put(`${backendUrl}/api/review/update`, formData, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                if (res.data.success) {
                    toast.success('Cập nhật đánh giá thành công!');
                    setShowReviewPopup(false);
                    loadOrderData();
                } else {
                    toast.error(res.data.message);
                }
            } else {
                // Handle new review
                if (reviewData.images && reviewData.images.length > 0) {
                    reviewData.images.forEach((image) => {
                        formData.append('images', image);
                    });
                }

                const res = await axios.post(`${backendUrl}/api/review/add`, formData, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (res.data.success) {
                    toast.success('Đánh giá thành công!');
                    setShowReviewPopup(false);
                    loadOrderData();
                } else {
                    toast.error(res.data.message);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className='border-t-2 border-gray-300 pt-16'>
            <div className='text-2xl'>
                <Title text1='ĐƠN HÀNG' text2='CỦA TÔI' />
            </div>

            <div className='flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar'>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setStatusFilter(tab.id)}
                        className={`px-4 py-2 border rounded min-w-fit whitespace-nowrap transition-colors ${statusFilter === tab.id ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className='flex flex-col gap-4'>
                {orderData?.filter(item => item.status === statusFilter).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Không có đơn hàng nào trong mục này.</p>
                ) : (
                    orderData?.filter(item => item.status === statusFilter).map((product, index) => (
                    <div key={index} className='py-4 border-y border-gray-300 text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                        <div className='flex items-start gap-6 text-sm'>
                            <img
                                className='w-16 sm:w-20 object-cover border border-gray-200 bg-gray-50'
                                src={product.productId?.image?.[0]?.url || '/no-image.jpg'}
                                alt={product.name}
                            />
                            <div>
                                <p className='sm:text-base font-medium'>{product.name}</p>
                                <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                                    <p>{currency}{product.price.toFixed(2)}</p>
                                    <p>Số lượng: {product.quantity}</p>
                                    {product.size && <p>Size: {product.size}</p>}
                                    {product.color && <p>Màu: {product.color}</p>}
                                </div>
                                <p className='mt-1'>Ngày đặt hàng: <span className='text-gray-400'>{new Date(product.date).toLocaleDateString()}</span></p>
                            </div>
                        </div>
                        <div className='flex justify-between md:w-1/2'>
                            <div className='flex items-center gap-2'>
                                <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                                <p className='text-sm md:text-base'>{getStatusText(product.status)}</p>
                            </div>
                            {product.status === 'Delivered' && user?.canComment && (
                                product.isReviewed ? (
                                    <div className="flex gap-2">
                                         <span className="px-4 py-2 text-sm font-medium text-green-600 border border-transparent">
                                             Đã đánh giá
                                         </span>
                                         <button 
                                             onClick={() => handleEditReview(product)}
                                             className="border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-50 text-blue-600 border-blue-200"
                                         >
                                             Sửa
                                         </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => handleReviewClick(product)}
                                        className="border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-50"
                                    >
                                        Đánh giá
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                ))
            )}
            </div>
            
            <ReviewPopup 
                isOpen={showReviewPopup} 
                onClose={() => setShowReviewPopup(false)}
                product={selectedProduct}
                onSubmit={handleSubmitReview}
                initialData={reviewInitialData}
            />
        </div>
    );
}

export default Orders;
