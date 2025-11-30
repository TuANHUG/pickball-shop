import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateTagGroupPopup = ({ editingTagGroup, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingTagGroup) {
            setFormData({
                name: editingTagGroup.name || '',
                description: editingTagGroup.description || '',
            });
        }
    }, [editingTagGroup]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingTagGroup
                ? `${import.meta.env.VITE_BACKEND_URL}/api/tag-group/${editingTagGroup.id}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/tag-group`;

            const method = editingTagGroup ? 'put' : 'post';

            const res = await axios[method](url, formData, {
                withCredentials: true,
            });

            if (res.data.success) {
                toast.success(res.data.message);
                onSuccess();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white bg-opacity-40 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
                <h2 className="text-xl font-bold mb-4">
                    {editingTagGroup ? 'Chỉnh sửa Tag Group' : 'Tạo Tag Group mới'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Tên Tag Group <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Nhập tên tag group"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Nhập mô tả (tùy chọn)"
                            rows="3"
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : editingTagGroup ? 'Cập nhật' : 'Tạo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTagGroupPopup;
