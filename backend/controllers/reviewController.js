import Review from "../models/reviewModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import { v2 as cloudinary } from "cloudinary";

const addReview = async (req, res) => {
    try {
        const { productId, orderId, rating, comment } = req.body;
        const userId = req.user._id;

        // Validation
        if (!productId || !orderId || !rating || !comment) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
        }

        // Check if already reviewed (double check besides unique index)
        const existingReview = await Review.findOne({ userId, productId, orderId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: "Bạn đã đánh giá sản phẩm này rồi" });
        }

        // Handle Images
        let imagesUrl = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(async (file) => {
                 const result = await cloudinary.uploader.upload(file.path, {
                     resource_type: "image",
                     folder: "reviews"
                 });
                 return {
                     url: result.secure_url,
                     public_id: result.public_id
                 };
            });
            imagesUrl = await Promise.all(uploadPromises);
        }

        // Create Review
        const review = new Review({
            userId,
            productId,
            orderId,
            rating: Number(rating),
            comment,
            images: imagesUrl
        });

        await review.save();

        // Update Order Item status
        await Order.updateOne(
            { _id: orderId, "items.productId": productId },
            { $set: { "items.$.isReviewed": true } }
        );

        // Update Product stats
        const reviews = await Review.find({ productId });
        const quantity = reviews.length;
        const average = reviews.reduce((acc, curr) => acc + curr.rating, 0) / quantity;

        await Product.findByIdAndUpdate(productId, {
            ratingsAverage: average,
            ratingsQuantity: quantity
        });

        res.status(201).json({ success: true, message: "Đánh giá thành công", review });

    } catch (error) {
        console.error("Add review error:", error);
        res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
}

const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ productId })
            .populate('userId', 'name') // Populate user name
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error("Get reviews error:", error);
        res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
}

const getUserReview = async (req, res) => {
    try {
        const { productId, orderId } = req.query;
        const userId = req.user._id;

        if (!productId || !orderId) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin productId hoặc orderId" });
        }

        const review = await Review.findOne({ userId, productId, orderId });
        
        if (!review) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá" });
        }

        res.status(200).json({ success: true, review });
    } catch (error) {
        console.error("Get user review error:", error);
        res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
}

const updateReview = async (req, res) => {
    try {
        const { reviewId, rating, comment, keptImages } = req.body;
        const userId = req.user._id;
        
        // keptImages might be a JSON string if sent via FormData
        let keptImagesIds = [];
        if (keptImages) {
            try {
                keptImagesIds = JSON.parse(keptImages); // Array of public_ids to keep
            } catch (e) {
                keptImagesIds = [keptImages]; // If it's a single string, wrap it
                if(Array.isArray(keptImages)) keptImagesIds = keptImages; 
            }
        }
        
        const review = await Review.findOne({ _id: reviewId, userId });
        if (!review) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá" });
        }

        // Handle deleted images
        const imagesToDelete = review.images.filter(img => !keptImagesIds.includes(img.public_id));
        if (imagesToDelete.length > 0) {
            const deletePromises = imagesToDelete.map(img => cloudinary.uploader.destroy(img.public_id));
            await Promise.all(deletePromises);
        }

        // Keep images
        const imagesToKeep = review.images.filter(img => keptImagesIds.includes(img.public_id));

        // Upload new images
        let newImagesData = [];
        if (req.files && req.files.length > 0) {
             const uploadPromises = req.files.map(async (file) => {
                 const result = await cloudinary.uploader.upload(file.path, {
                     resource_type: "image",
                     folder: "reviews"
                 });
                 return {
                     url: result.secure_url,
                     public_id: result.public_id
                 };
            });
            newImagesData = await Promise.all(uploadPromises);
        }

        // Update Review
        review.rating = Number(rating);
        review.comment = comment;
        review.images = [...imagesToKeep, ...newImagesData];
        
        await review.save();

        // Recalculate Product stats
        const productId = review.productId;
        const reviews = await Review.find({ productId });
        const quantity = reviews.length;
        const average = reviews.reduce((acc, curr) => acc + curr.rating, 0) / quantity;

        await Product.findByIdAndUpdate(productId, {
            ratingsAverage: average,
            ratingsQuantity: quantity
        });

        res.status(200).json({ success: true, message: "Cập nhật đánh giá thành công", review });

    } catch (error) {
         console.error("Update review error:", error);
         res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
}

export { addReview, getProductReviews, getUserReview, updateReview };
