import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "react-toastify";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Review = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [productName, setProductName] = useState('');

    const [replyingTo, setReplyingTo] = useState(null);
    const [replyComment, setReplyComment] = useState("");

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/review/${productId}`, { withCredentials: true });
            if (res.data.success) {
                setReviews(res.data.reviews);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi tải đánh giá");
        } finally {
            setLoading(false);
        }
    };

    const fetchProduct = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/product/single/${productId}`);
            if (res.data.success) {
                setProductName(res.data.product.name);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleStartReply = (review) => {
        setReplyingTo(review._id);
        setReplyComment(review.reply?.comment || "");
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
        setReplyComment("");
    };

    const handleSubmitReply = async (reviewId) => {
        if (!replyComment.trim()) {
            toast.error("Vui lòng nhập nội dung trả lời");
            return;
        }

        try {
            const res = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/review/reply`,
                { reviewId, comment: replyComment },
                { withCredentials: true }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                setReplyingTo(null);
                setReplyComment("");
                fetchReviews();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi gửi câu trả lời");
        }
    };

    const handleDeleteReply = async (reviewId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa phản hồi này không?")) {
            try {
                const res = await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/api/review/reply/remove`,
                    { reviewId },
                    { withCredentials: true }
                );

                if (res.data.success) {
                    toast.success(res.data.message);
                    fetchReviews();
                } else {
                    toast.error(res.data.message);
                }
            } catch (error) {
                console.error(error);
                toast.error("Lỗi khi xóa phản hồi");
            }
        }
    };

    const handleHideReview = async (reviewId) => {
        try {
            const res = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/review/hide`,
                { reviewId },
                { withCredentials: true }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                fetchReviews();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi thay đổi trạng thái ẩn/hiện");
        }
    };

    useEffect(() => {
        if (productId) {
            fetchReviews();
            fetchProduct();
        }
    }, [productId]);

    return (
        <div>
            <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-gray-600 hover:text-black">
                <ArrowBackIcon fontSize="small" /> Quay lại danh sách
            </button>
            <h2 className="text-xl font-bold mb-4">Đánh giá sản phẩm: <span className="text-blue-600">{productName}</span></h2>

            {loading ? <p>Đang tải...</p> : (
                <div className="flex flex-col gap-4">
                    {reviews.length === 0 ? (
                        <p className="text-gray-500 italic">Chưa có đánh giá nào cho sản phẩm này.</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review._id} className={`bg-white p-4 rounded shadow-sm border border-gray-100 ${review.hidden ? 'opacity-70 bg-gray-50' : ''}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                            {review.userId?.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{review.userId?.name || "Người dùng ẩn danh"}</p>
                                            <div className="flex text-amber-500 text-xs">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs text-gray-400">
                                            {new Date(review.createdAt).toLocaleDateString('vi-VN')} {new Date(review.createdAt).toLocaleTimeString('vi-VN')}
                                        </span>
                                        <div className="flex gap-2 items-center">
                                            {review.hidden && <span className="text-[10px] font-bold text-red-500 border border-red-500 px-1 rounded">HIDDEN</span>}
                                            <button
                                                onClick={() => handleHideReview(review._id)}
                                                className={`text-xs font-medium ${review.hidden ? 'text-blue-600' : 'text-gray-500'} hover:underline`}
                                            >
                                                {review.hidden ? 'Hiện' : 'Ẩn'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm mb-3 pl-10">{review.comment}</p>

                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-2 pl-10">
                                        {review.images.map((img, i) => (
                                            <a key={i} href={img.url} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={img.url}
                                                    alt="Review"
                                                    className="w-20 h-20 object-cover rounded border hover:opacity-80 transition"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4 pl-10">
                                    {replyingTo === review._id ? (
                                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                            <p className="text-sm font-medium mb-2">Trả lời đánh giá:</p>
                                            <textarea
                                                className="w-full border border-gray-300 rounded p-2 text-sm mb-2 focus:border-blue-500 focus:outline-none"
                                                rows="3"
                                                value={replyComment}
                                                onChange={(e) => setReplyComment(e.target.value)}
                                                placeholder="Nhập câu trả lời của bạn..."
                                            ></textarea>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={handleCancelReply}
                                                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-white transition"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    onClick={() => handleSubmitReply(review._id)}
                                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                                >
                                                    Gửi trả lời
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        review.reply && review.reply.comment ? (
                                            <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-xs font-bold text-blue-600 mb-1">Shop phản hồi:</p>
                                                        <p className="text-sm text-gray-700">{review.reply.comment}</p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {new Date(review.reply.createdAt).toLocaleString('vi-VN')}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleStartReply(review)}
                                                            className="text-xs text-blue-600 hover:underline"
                                                        >
                                                            Sửa
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteReply(review._id)}
                                                            className="text-xs text-red-600 hover:underline"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleStartReply(review)}
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                Trả lời
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Review;
