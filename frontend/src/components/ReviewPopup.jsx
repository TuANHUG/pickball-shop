import React, { useState, useEffect } from 'react';
import { assets } from '../assets/frontend_assets/assets';

const ReviewPopup = ({ isOpen, onClose, product, onSubmit, initialData }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [existingImages, setExistingImages] = useState([]); // [{ url, public_id }]
    const [newImages, setNewImages] = useState([]); // [File]
    const [previewNewImages, setPreviewNewImages] = useState([]); // [BlobUrl]

    // Reset or Initialize form
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setRating(initialData.rating);
                setComment(initialData.comment);
                setExistingImages(initialData.images || []);
                setNewImages([]);
                setPreviewNewImages([]);
            } else {
                setRating(5);
                setComment('');
                setExistingImages([]);
                setNewImages([]);
                setPreviewNewImages([]);
            }
        }
    }, [isOpen, product, initialData]);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = existingImages.length + newImages.length + files.length;
        
        if (totalImages > 4) {
            alert('Chỉ được chọn tối đa 4 ảnh');
            return;
        }

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setNewImages([...newImages, ...files]);
        setPreviewNewImages([...previewNewImages, ...newPreviews]);
    };

    const removeExistingImage = (index) => {
        const updated = [...existingImages];
        updated.splice(index, 1);
        setExistingImages(updated);
    };

    const removeNewImage = (index) => {
         const updatedImages = [...newImages];
         updatedImages.splice(index, 1);
         setNewImages(updatedImages);

         const updatedPreviews = [...previewNewImages];
         URL.revokeObjectURL(updatedPreviews[index]); 
         updatedPreviews.splice(index, 1);
         setPreviewNewImages(updatedPreviews);
    };

    const handleSubmit = () => {
        const submitData = { 
            rating, 
            comment, 
            productId: product.productId._id,
            orderId: product.orderId,
            // If editing, pass reviewId
            reviewId: initialData?._id,
            // Separate existing and new images
            keptImages: existingImages.map(img => img.public_id), 
            newImages: newImages // This is Array of File
        };
        
        // Ensure backward compatibility if needed, or just let onSubmit handle it
        onSubmit(submitData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative animate-fade-in mx-4">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
                
                <h2 className="text-xl font-bold mb-4 text-center">{initialData ? 'Sửa đánh giá' : 'Đánh giá sản phẩm'}</h2>
                
                {product && (
                     // ...existing code...
                     <div className="flex items-center gap-4 mb-4 border-b pb-4">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-16 h-16 object-cover rounded border" 
                        />
                        <div>
                            <p className="font-medium line-clamp-1">{product.name}</p>
                            <div className="text-sm text-gray-500 flex gap-2">
                                {product.size && <span>Size: {product.size}</span>}
                                {product.color && <span>Màu: {product.color}</span>}
                            </div>
                        </div>
                     </div>
                )}

                <div className="mb-4">
                    <p className="mb-2 font-medium">Chất lượng sản phẩm</p>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button 
                                key={star} 
                                onClick={() => setRating(star)}
                                className="text-3xl focus:outline-none transition-transform hover:scale-110 text-yellow-400"
                                type="button"
                            >
                                {star <= rating ? '★' : '☆'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                     <label className="block mb-2 font-medium">Viết đánh giá</label>
                     <textarea
                        className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-black resize-none"
                        rows="4"
                        placeholder="Hãy chia sẻ nhận xét cho sản phẩm này bạn nhé..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                     ></textarea>
                </div>

                <div className="mb-6">
                    <label className="block mb-2 font-medium">Thêm hình ảnh (Tối đa 4, không bắt buộc)</label>
                    <div className="flex gap-2 flex-wrap">
                        {/* Display Existing Images */}
                         {existingImages.map((img, index) => (
                             <div key={`existing-${index}`} className="relative w-20 h-20 border rounded overflow-hidden group">
                                 <img src={img.url} alt="Existing" className="w-full h-full object-cover" />
                                 <button 
                                     onClick={() => removeExistingImage(index)}
                                     className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-bl text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                 >
                                     ✕
                                 </button>
                             </div>
                         ))}
                         
                        {/* Display New Images */}
                         {previewNewImages.map((src, index) => (
                             <div key={`new-${index}`} className="relative w-20 h-20 border rounded overflow-hidden group">
                                 <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                 <button 
                                     onClick={() => removeNewImage(index)}
                                     className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-bl text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                 >
                                     ✕
                                 </button>
                             </div>
                         ))}
                         
                         {(existingImages.length + newImages.length) < 4 && (
                             <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
                                 <span className="text-2xl">+</span>
                                 <input 
                                     type="file" 
                                     accept="image/*" 
                                     multiple 
                                     className="hidden" 
                                     onChange={handleImageChange}
                                 />
                             </label>
                         )}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 font-medium"
                    >
                        Trở lại
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 font-medium"
                    >
                        Hoàn thành
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewPopup;
