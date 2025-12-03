import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import CreateTagPopup from './components/CreateTagPopup';
import CreateTagGroupPopup from './components/CreateTagGroupPopup';

const Tag = () => {
    const [tagGroups, setTagGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTagPopup, setShowTagPopup] = useState(false);
    const [showTagGroupPopup, setShowTagGroupPopup] = useState(false);
    const [editingTag, setEditingTag] = useState(null);
    const [editingTagGroup, setEditingTagGroup] = useState(null);

    const fetchTagGroups = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tag/tag-by-group`);
            if (res.data.success) {
                setTagGroups(res.data.data);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch tags');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTag = async (tagId) => {
        if (!window.confirm('Bạn có chắc muốn xóa tag này?')) return;
        try {
            const res = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/api/tag/${tagId}`,
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                fetchTagGroups();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to delete tag');
        }
    };

    const handleDeleteTagGroup = async (groupId) => {
        if (!window.confirm('Bạn có chắc muốn xóa tag group này?')) return;
        try {
            const res = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/api/tag-group/${groupId}`,
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                fetchTagGroups();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to delete tag group');
        }
    };

    const handleEditTag = (tag, groupId) => {
        setEditingTag({ ...tag, tag_group_id: groupId });
        setShowTagPopup(true);
    };

    const handleEditTagGroup = (group) => {
        setEditingTagGroup(group);
        setShowTagGroupPopup(true);
    };

    useEffect(() => {
        fetchTagGroups();
    }, []);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý Tags</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setEditingTag(null);
                            setShowTagPopup(true);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                        + Tạo Tag
                    </button>
                    <button
                        onClick={() => {
                            setEditingTagGroup(null);
                            setShowTagGroupPopup(true);
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    >
                        + Tạo Tag Group
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="text-center text-gray-500">Đang tải...</p>
            ) : tagGroups.length === 0 ? (
                <p className="text-center text-gray-500">Chưa có tag group nào</p>
            ) : (
                <div className="space-y-6">
                    {tagGroups.map((group) => (
                        <div key={group.id} className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">{group.name}</h2>
                                    {group.description && (
                                        <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditTagGroup(group)}
                                        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTagGroup(group.id)}
                                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>

                            {group.tags.length === 0 ? (
                                <p className="text-gray-400 text-sm">Chưa có tag nào trong nhóm này</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {group.tags.map((tag) => (
                                        <div
                                            key={tag.id}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full border border-blue-300"
                                        >
                                            <span className="text-sm font-medium">{tag.name}</span>
                                            <button
                                                onClick={() => handleEditTag(tag, group.id)}
                                                className="text-yellow-600 hover:text-yellow-800 text-xs"
                                                title="Sửa"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTag(tag.id)}
                                                className="text-red-600 hover:text-red-800 text-xs font-bold"
                                                title="Xóa"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showTagPopup && (
                <CreateTagPopup
                    tagGroups={tagGroups}
                    editingTag={editingTag}
                    onClose={() => {
                        setShowTagPopup(false);
                        setEditingTag(null);
                    }}
                    onSuccess={() => {
                        fetchTagGroups();
                        setShowTagPopup(false);
                        setEditingTag(null);
                    }}
                />
            )}

            {showTagGroupPopup && (
                <CreateTagGroupPopup
                    editingTagGroup={editingTagGroup}
                    onClose={() => {
                        setShowTagGroupPopup(false);
                        setEditingTagGroup(null);
                    }}
                    onSuccess={() => {
                        fetchTagGroups(); 
                        setShowTagGroupPopup(false);
                        setEditingTagGroup(null);
                    }}
                />
            )}
        </div>
    );
};

export default Tag;
