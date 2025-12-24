import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const List = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDocs, setTotalDocs] = useState(0);
    
    // Filters
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [selectedTags, setSelectedTags] = useState([]);
    const [tagGroups, setTagGroups] = useState([]);

    // Sort
    const [sort, setSort] = useState("");
    const [order, setOrder] = useState("desc");
    const [showFilter, setShowFilter] = useState(false);

    // Bulk Action
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [bulkDiscountValue, setBulkDiscountValue] = useState(0);

    const navigate = useNavigate();
    const limit = 10;
    const currency = "$";

    // Fetch Tag Groups
    const fetchTagGroups = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tag/tag-by-group`);
            if (res.data.success) {
                setTagGroups(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTagGroups();
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                search,
                status,
                tag: selectedTags.join(','),
                sort,
                order
            };
            
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/product/admin-list`, {
                params,
                withCredentials: true
            });
            
            if (res.data.success) {
                setProducts(res.data.products);
                setTotalPages(res.data.totalPages);
                setTotalDocs(res.data.total);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    }, [page, search, status, selectedTags, sort, order]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSort = (field) => {
        if (sort === field) {
            setOrder(order === 'asc' ? 'desc' : 'asc');
        } else {
            setSort(field);
            setOrder('desc'); // Default to desc for numbers usually
        }
    };

    const toggleTag = (tagId) => {
        setSelectedTags(prev => 
            prev.includes(tagId) 
                ? prev.filter(id => id !== tagId) 
                : [...prev, tagId]
        );
        setPage(1); // Reset to page 1 on filter change
    };

    // Bulk Action Handlers
    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedProducts([]);
    };

    const handleSelectProduct = (id) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => p._id));
        }
    };

    const handleBulkUpdate = async () => {
        if (selectedProducts.length === 0) return toast.error("Chưa chọn sản phẩm nào");
        if (bulkDiscountValue < 0 || bulkDiscountValue > 100) return toast.error("Phần trăm giảm giá không hợp lệ");
        
        confirmAlert({
            message: `Bạn có chắc chắn muốn cập nhật giảm giá ${bulkDiscountValue}% cho ${selectedProducts.length} sản phẩm đã chọn?`,
            buttons: [
                {
                    label: 'Đồng ý',
                    onClick: async () => {
                        try {
                            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/product/bulk-discount`, {
                                productIds: selectedProducts,
                                discount: Number(bulkDiscountValue)
                            }, { withCredentials: true });
                            if (res.data.success) {
                                toast.success(res.data.message);
                                fetchProducts();
                                setIsSelectionMode(false);
                                setSelectedProducts([]);
                            } else {
                                toast.error(res.data.message);
                            }
                        } catch (error) {
                            console.error(error);
                            toast.error("Lỗi cập nhật");
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
                                fetchProducts(); // Refresh list
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

    const SortIcon = ({ field }) => {
        if (sort !== field) return <span className="text-gray-300 text-xs ml-1">↕</span>;
        return order === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
    };

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-semibold">Danh sách sản phẩm ({totalDocs})</p>
                <div className="flex gap-2">
                    <button
                        onClick={toggleSelectionMode}
                        className={`px-4 py-2 rounded transition ${isSelectionMode ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        {isSelectionMode ? "Hủy chọn" : "Quản lý giảm giá"}
                    </button>
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                    >
                        {showFilter ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
                    </button>
                    <button
                        onClick={() => navigate('/manage-product/add')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                        + Thêm sản phẩm
                    </button>
                </div>
            </div>

            {/* Bulk Action Panel */}
            {isSelectionMode && (
                <div className="bg-blue-50 p-4 rounded shadow mb-4 border border-blue-200 flex items-center gap-4">
                    <span className="font-medium text-blue-800">Đã chọn: {selectedProducts.length} sản phẩm</span>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Giảm giá (%):</label>
                        <input 
                            type="number" 
                            min="0" 
                            max="100"
                            value={bulkDiscountValue}
                            onChange={(e) => setBulkDiscountValue(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-20"
                        />
                        <button 
                            onClick={handleBulkUpdate}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                            Áp dụng
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            {showFilter && (
                <div className="bg-white p-4 rounded shadow mb-4 border border-gray-200">
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm tên</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                placeholder="Nhập tên sản phẩm..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <div className="w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                value={status}
                                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                            >
                                <option value="all">Tất cả</option>
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Không hoạt động</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo Tags</label>
                        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto border p-3 rounded bg-gray-50">
                            {tagGroups.map(group => (
                                <div key={group.id} className="border-b border-gray-200 pb-2 last:border-0">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">{group.name}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {group.tags.map(tag => (
                                            <button
                                                key={tag.id}
                                                onClick={() => toggleTag(tag.id)}
                                                className={`px-2 py-1 text-xs rounded-full border transition-colors ${selectedTags.includes(tag.id)
                                                        ? 'bg-blue-500 text-white border-blue-500'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="flex flex-col gap-2">
                <div className={`hidden md:grid ${isSelectionMode ? 'grid-cols-[40px_1fr_2fr_3fr_1fr_1fr_1fr_1fr_1fr_1fr]' : 'grid-cols-[1fr_2fr_3fr_1fr_1fr_1fr_1fr_1fr_1fr]'} items-center py-2 px-2 border border-gray-200 bg-gray-100 text-sm font-bold`}>
                    {isSelectionMode && (
                        <div className="flex justify-center">
                            <input 
                                type="checkbox" 
                                checked={products.length > 0 && selectedProducts.length === products.length}
                                onChange={handleSelectAll}
                                className="w-4 h-4"
                            />
                        </div>
                    )}
                    <div>Ảnh</div>
                    <div className="cursor-pointer hover:text-blue-600" onClick={() => handleSort('name')}>
                        Tên <SortIcon field="name" />
                    </div>
                    <div>Tags</div>
                    <div className="cursor-pointer hover:text-blue-600" onClick={() => handleSort('price')}>
                        Giá <SortIcon field="price" />
                    </div>
                    <div className="cursor-pointer hover:text-blue-600" onClick={() => handleSort('discount')}>
                        Giảm giá <SortIcon field="discount" />
                    </div>
                    <div className="cursor-pointer hover:text-blue-600" onClick={() => handleSort('sold')}>
                        Đã bán <SortIcon field="sold" />
                    </div>
                    <div className="cursor-pointer hover:text-blue-600" onClick={() => handleSort('quantity')}>
                        Số lượng <SortIcon field="quantity" />
                    </div>
                    <div>Trạng thái</div>
                    <div className="text-center">Thao tác</div>
                </div>

                {loading ? (
                    <p className="text-center py-4">Đang tải...</p>
                ) : products.length === 0 ? (
                    <p className="text-center py-4">Không tìm thấy sản phẩm.</p>
                ) : (
                    products.map((product) => (
                        <div
                            key={product._id}
                            className={`grid ${isSelectionMode ? 'grid-cols-[40px_1fr_2fr_3fr_1fr_1fr_1fr_1fr_1fr_1fr]' : 'grid-cols-[1fr_2fr_3fr_1fr_1fr_1fr_1fr_1fr_1fr]'} items-center gap-2 py-2 px-2 border border-gray-200 text-sm hover:bg-gray-50 ${selectedProducts.includes(product._id) ? 'bg-blue-50' : ''}`}
                            onClick={() => isSelectionMode && handleSelectProduct(product._id)}
                        >
                            {isSelectionMode && (
                                <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedProducts.includes(product._id)}
                                        onChange={() => handleSelectProduct(product._id)}
                                        className="w-4 h-4"
                                    />
                                </div>
                            )}
                            <img className="w-12 h-12 object-cover" src={product.image[0]?.url} alt={product.name} />
                            <p className="font-medium">{product.name}</p>
                            <div className="flex flex-wrap gap-1">
                                {Array.isArray(product.tags) && product.tags.length > 0 ? (
                                    product.tags.map((tag, idx) => (
                                        <span
                                            key={tag._id || idx}
                                            className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px]"
                                        >
                                            {tag.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400 text-xs">--</span>
                                )}
                            </div>
                            <p>{currency}{product.price}</p>
                            <p>{product.discount}%</p>
                            <p>{product.sold}</p>
                            <p>{product.quantity}</p>
                            <p className={`font-medium ${product.status === "active" ? "text-green-600" : "text-red-600"}`}>
                                {product.status === "active" ? "Hoạt động" : "Dừng"}
                            </p>
                            <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => navigate(`/manage-product/edit/${product._id}`)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                    title="Sửa"
                                >
                                    <EditIcon fontSize="small" />
                                </button>
                                <button
                                    onClick={() => removeProduct(product._id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                                    title="Xóa"
                                >
                                    <DeleteIcon fontSize="small" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                    >
                        Trước
                    </button>
                    <span className="text-sm">
                        Trang {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                    >
                        Sau
                    </button>
                </div>
            )}
        </>
    );
};

export default List;
