import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateTagPopup = ({ tagGroups, editingTag, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        tag_group_id: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingTag) {
            setFormData({
                name: editingTag.name || '',
                tag_group_id: editingTag.tag_group_id || '',
                description: editingTag.description || '',
            });
        } else if (tagGroups.length > 0) {
            setFormData((prev) => ({
                ...prev,
                tag_group_id: tagGroups[0].id,
            }));
        }
    }, [editingTag, tagGroups]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingTag
                ? `${import.meta.env.VITE_BACKEND_URL}/api/tag/${editingTag.id}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/tag`;

            const method = editingTag ? 'put' : 'post';

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
                    {editingTag ? 'Chỉnh sửa Tag' : 'Tạo Tag mới'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Tên Tag <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập tên tag"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Tag Group <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.tag_group_id}
                            onChange={(e) =>
                                setFormData({ ...formData, tag_group_id: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            {tagGroups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : editingTag ? 'Cập nhật' : 'Tạo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTagPopup;
