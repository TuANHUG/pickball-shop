import React, { useState, useEffect } from "react";
import { assets } from "../../assets/admin_assets/assets.js";
import axios from "axios";
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router';

const MAX_IMAGE_SIZE_MB = 2;

const Edit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [images, setImages] = useState([null, null, null, null]);
    const [existingImages, setExistingImages] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [tagGroups, setTagGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingTags, setLoadingTags] = useState(true);
    const [loadingProduct, setLoadingProduct] = useState(true);

    useEffect(() => {
        fetchTagGroups();
        fetchProductData();
    }, [id]);

    const fetchProductData = async () => {
        setLoadingProduct(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/product/single/${id}`);
            if (res.data.success) {
                const product = res.data.product;
                setName(product.name);
                setDescription(product.description);
                setPrice(product.price);
                setSelectedTags(product.tags.map(tag => tag._id));
                setExistingImages(product.image);
            } else {
                toast.error(res.data.message);
                navigate('/list');
            }
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải thông tin sản phẩm');
            navigate('/list');
        } finally {
            setLoadingProduct(false);
        }
    };

    const fetchTagGroups = async () => {
        setLoadingTags(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tag/tag-by-group`);
            if (res.data.success) {
                setTagGroups(res.data.data);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải tags');
        } finally {
            setLoadingTags(false);
        }
    };

    const isValidImage = (file) =>
        file && file.type.startsWith("image/") && file.size <= MAX_IMAGE_SIZE_MB * 1024 * 1024;

    const handleImageChange = (index, file) => {
        if (!isValidImage(file)) {
            toast.error(`Tệp không hợp lệ: Phải là ảnh và nhỏ hơn ${MAX_IMAGE_SIZE_MB}MB`);
            return;
        }
        setImages((prev) => {
            const newImages = [...prev];
            newImages[index] = file;
            return newImages;
        });
    };

    const toggleTag = (tagId) => {
        setSelectedTags((prev) =>
            prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
        );
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (selectedTags.length === 0) {
            toast.error("Vui lòng chọn ít nhất 1 tag");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("tags", JSON.stringify(selectedTags));

            // Only append new images that were selected
            images.forEach((img, index) => {
                if (img) formData.append(`image${index + 1}`, img);
            });

            const res = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/product/edit/${id}`,
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                navigate('/manage-product');
            } else {
                toast.error(res.data.message);
            }

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loadingProduct) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500 text-lg">Đang tải thông tin sản phẩm...</p>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
            <div>
                <p className="mb-2">Tải ảnh lên (Chọn ảnh mới để thay thế)</p>
                <div className="flex gap-2">
                    {[0, 1, 2, 3].map((index) => (
                        <label key={index} htmlFor={`image${index}`}>
                            <img
                                className="w-20 h-20 object-cover border"
                                src={
                                    images[index]
                                        ? URL.createObjectURL(images[index])
                                        : existingImages[index]?.url || assets.upload_area
                                }
                                alt={`Ảnh ${index + 1}`}
                            />
                            <input
                                type="file"
                                id={`image${index}`}
                                hidden
                                accept="image/*"
                                onChange={(e) => handleImageChange(index, e.target.files[0])}
                            />
                        </label>
                    ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                    {images.some(img => img) ? "Ảnh mới sẽ thay thế toàn bộ ảnh cũ" : "Click vào ảnh để thay đổi"}
                </p>
            </div>

            <div className="w-full">
                <p className="mb-2">Tên sản phẩm</p>
                <input
                    type="text"
                    className="w-full max-w-[500px] px-3 py-2"
                    placeholder="Nhập tên sản phẩm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className="w-full">
                <p className="mb-2">Mô tả sản phẩm</p>
                <textarea
                    className="w-full max-w-[500px] px-3 py-2"
                    placeholder="Viết nội dung ở đây"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            <div className="w-full">
                <p className="mb-2">Giá</p>
                <input
                    type="number"
                    className="w-full max-w-[500px] px-3 py-2"
                    placeholder="25"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
            </div>

            {loadingTags ? (
                <p className="text-gray-500">Đang tải tags...</p>
            ) : (
                <div className="w-full space-y-4">
                    <p className="mb-2 font-medium">Chọn Tags (ít nhất 1 tag)</p>
                    {tagGroups.map((group) => (
                        <div key={group.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                            <h3 className="font-semibold text-gray-800 mb-2">{group.name}</h3>
                            {group.description && (
                                <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                            )}
                            {group.tags.length === 0 ? (
                                <p className="text-sm text-gray-400">Chưa có tag nào</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {group.tags.map((tag) => (
                                        <div
                                            key={tag.id}
                                            onClick={() => toggleTag(tag.id)}
                                            className={`${selectedTags.includes(tag.id)
                                                    ? "bg-blue-500 text-white border-blue-600"
                                                    : "bg-white text-gray-700 border-gray-300"
                                                } px-3 py-1.5 cursor-pointer rounded-full border-2 transition-all hover:shadow-md`}
                                        >
                                            {tag.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <div className="flex gap-4">
                <button
                    type="submit"
                    className="w-28 py-3 mt-4 bg-black text-white"
                    disabled={loading}
                >
                    {loading ? "ĐANG CẬP NHẬT..." : "CẬP NHẬT"}
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/manage-product')}
                    className="w-28 py-3 mt-4 bg-gray-500 text-white"
                    disabled={loading}
                >
                    HỦY
                </button>
            </div>
        </form>
    );
};

export default Edit;
