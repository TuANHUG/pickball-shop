import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const CreateInventoryLog = () => {
    const [type, setType] = useState("IMPORT");
    const [createdBy, setCreatedBy] = useState("");
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (search) {
            const delayDebounceFn = setTimeout(() => {
                searchProducts();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setSearchResults([]);
        }
    }, [search]);

    const searchProducts = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/product/admin-list?search=${search}&limit=5`,
                { withCredentials: true }
            );
            if (response.data.success) {
                setSearchResults(response.data.products);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setSearch("");
        setSearchResults([]);
        setQuantity(1);
    };

    const handleAddItem = () => {
        if (!selectedProduct) return;
        if (quantity <= 0) {
            toast.error("Số lượng phải lớn hơn 0");
            return;
        }

        const existingItemIndex = items.findIndex(
            (item) => item.product_id === selectedProduct._id
        );

        if (existingItemIndex > -1) {
            const newItems = [...items];
            newItems[existingItemIndex].quantity += parseInt(quantity);
            setItems(newItems);
        } else {
            setItems([
                ...items,
                {
                    product_id: selectedProduct._id,
                    name: selectedProduct.name,
                    quantity: parseInt(quantity),
                    image: selectedProduct.image[0]?.url,
                },
            ]);
        }

        setSelectedProduct(null);
        setQuantity(1);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleSubmit = async () => {
        if (!createdBy) {
            toast.error("Vui lòng nhập tên người thực hiện");
            return;
        }
        if (items.length === 0) {
            toast.error("Vui lòng thêm ít nhất một sản phẩm");
            return;
        }

        setLoading(true);
        try {
            // 1. Update product quantities
            const updateResponse = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/product/update-quantity`,
                {
                    items: items.map((item) => ({
                        product_id: item.product_id,
                        quantity: item.quantity,
                    })),
                    type,
                },
                { withCredentials: true }
            );

            if (!updateResponse.data.success) {
                toast.error(updateResponse.data.message);
                setLoading(false);
                return;
            }

            // 2. Create inventory log
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/inventory-log/create`,
                {
                    type,
                    created_by: createdBy,
                    items: items.map((item) => ({
                        product_id: item.product_id,
                        quantity: item.quantity,
                    })),
                },
                { withCredentials: true }
            );

            if (response.data.success) {
                toast.success("Tạo phiếu thành công");
                navigate("/inventory");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Tạo phiếu Xuất/Nhập kho</h2>
                <button
                    onClick={() => navigate("/inventory")}
                    className="text-gray-500 hover:text-gray-700"
                >
                    Quay lại
                </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại phiếu
                    </label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                        <option value="IMPORT">Nhập kho</option>
                        <option value="EXPORT">Xuất kho</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Người thực hiện
                    </label>
                    <input
                        type="text"
                        value={createdBy}
                        onChange={(e) => setCreatedBy(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Nhập tên người thực hiện"
                    />
                </div>
            </div>

            <div className="mb-6 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tìm kiếm sản phẩm
                </label>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Nhập tên sản phẩm..."
                />
                {searchResults.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto shadow-lg">
                        {searchResults.map((product) => (
                            <li
                                key={product._id}
                                onClick={() => handleSelectProduct(product)}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                            >
                                <img
                                    src={product.image[0]?.url}
                                    alt={product.name}
                                    className="w-8 h-8 object-cover rounded"
                                />
                                <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-xs text-gray-500">
                                        Kho: {product.quantity}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {selectedProduct && (
                <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200 flex items-end gap-4">
                    <div className="flex-1">
                        <p className="font-medium mb-1">Sản phẩm đang chọn:</p>
                        <div className="flex items-center gap-2">
                            <img
                                src={selectedProduct.image[0]?.url}
                                alt={selectedProduct.name}
                                className="w-10 h-10 object-cover rounded"
                            />
                            <span className="font-semibold">{selectedProduct.name}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số lượng
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                            className="w-24 border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <button
                        onClick={handleAddItem}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Thêm
                    </button>
                </div>
            )}

            <div className="mb-6">
                <h3 className="font-medium mb-2">Danh sách sản phẩm</h3>
                {items.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 border border-dashed rounded">
                        Chưa có sản phẩm nào được thêm
                    </p>
                ) : (
                    <div className="border rounded overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Sản phẩm
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Số lượng
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2 flex items-center gap-2">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-8 h-8 object-cover rounded"
                                            />
                                            <span className="text-sm">{item.name}</span>
                                        </td>
                                        <td className="px-4 py-2 text-sm">{item.quantity}</td>
                                        <td className="px-4 py-2 text-right">
                                            <button
                                                onClick={() => handleRemoveItem(index)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2">
                <button
                    onClick={() => navigate("/inventory")}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                    Hủy
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                >
                    {loading ? "Đang xử lý..." : "Tạo phiếu"}
                </button>
            </div>
        </div>
    );
};

export default CreateInventoryLog;
