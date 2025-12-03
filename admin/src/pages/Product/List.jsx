import axios from "axios";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const List = () => {
    const [products, setProducts] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const observer = useRef(null);
    const navigate = useNavigate();
    const limit = 10;
    const currency = "$";

    const fetchProducts = useCallback(async () => {
        if (!hasMore || loading) return;
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/product/list`, {
                params: {
                    lastId: nextCursor,
                    limit
                }
            });
            if (res.data.success) {
                setProducts(prev => [...prev, ...res.data.products]);
                setNextCursor(res.data.nextCursor);
                setHasMore(res.data.hasMore);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    }, [nextCursor, hasMore, loading]);

    const removeProduct = async (id) => {
        confirmAlert({
            message: 'Bạn có chắc chắn muốn xóa sản phẩm này không?',
            buttons: [
                {
                    label: 'Xóa',
                    onClick: async () => {
                        try {
                            const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/product/remove/${id}`, {
                                withCredentials: true
                            });
                            if (res.data.success) {
                                toast.success(res.data.message);
                                setProducts(prev => prev.filter(p => p._id !== id));
                            } else {
                                toast.error(res.data.message);
                            }
                        } catch (error) {
                            console.error(error);
                            toast.error(error.message);
                        }
                    }
                },
                {
                    label: 'Hủy',
                    onClick: () => { }
                }
            ]
        });
    };

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const lastProductRef = useCallback((node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchProducts();
            }
        });

        if (node) observer.current.observe(node);
    }, [fetchProducts, hasMore, loading]);

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-semibold">Danh sách tất cả sản phẩm</p>
                <button
                    onClick={() => navigate('/manage-product/add')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    + Thêm sản phẩm
                </button>
            </div>
            <div className="flex flex-col gap-2">
                <div className="hidden md:grid grid-cols-[1fr_3fr_2fr_1fr_1fr] items-center py-1 px-2 border border-gray-200 bg-gray-100 text-sm">
                    <b>Ảnh</b>
                    <b>Tên</b>
                    <b>Tags</b>
                    <b>Giá</b>
                    <b className="text-center">Thao tác</b>
                </div>

                {products.map((product, index) => {
                    const isLast = index === products.length - 1;
                    return (
                        <div
                            key={product._id}
                            ref={isLast ? lastProductRef : null}
                            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_2fr_1fr_1fr] items-center gap-2 py-1 px-2 border border-gray-200 text-sm"
                        >
                            <img className="w-12" src={product.image[0]?.url} alt={product.name} />
                            <p>{product.name}</p>
                            <div className="flex flex-wrap gap-1">
                                {Array.isArray(product.tags) && product.tags.length > 0 ? (
                                    product.tags.map((tag, idx) => (
                                        <span
                                            key={tag._id || idx}
                                            className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs"
                                        >
                                            {tag.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400 text-xs">Chưa có tag</span>
                                )}
                            </div>
                            <p>{currency + product.price}</p>
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => navigate(`/manage-product/edit/${product._id}`)}
                                    className="text-blue-600 hover:text-blue-800 transition"
                                    title="Sửa"
                                >
                                    <EditIcon fontSize="small" />
                                </button>
                                <button
                                    onClick={() => removeProduct(product._id)}
                                    className="text-red-600 hover:text-red-800 transition"
                                    title="Xóa"
                                >
                                    <DeleteIcon fontSize="small" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {loading && <p className="text-center mt-4">Đang tải...</p>}
            {!loading && products.length === 0 && <p className="text-center mt-4">Không tìm thấy sản phẩm.</p>}
        </>
    );
};

export default List;
