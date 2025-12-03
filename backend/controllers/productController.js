import { v2 as cloudinary } from "cloudinary";
import Product from "../models/productModel.js";
import Tag from "../models/tagModel.js";
import { productSchema } from "../validation/productValidation.js";

// Function to add product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, tags} = req.body;

    // Parse tags if sent as JSON string
    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;

    const { error, value } = productSchema.validate(
      { name, description, price, tags: parsedTags},
      { abortEarly: false }
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Xác thực dữ liệu thất bại",
        errors: error.details.map((err) => err.message),
      });
    }

    // Validate that all tags exist
    const tagsExist = await Tag.countDocuments({ _id: { $in: value.tags } });
    if (tagsExist !== value.tags.length) {
      return res
        .status(400)
        .json({ success: false, message: "Một hoặc nhiều tag không tồn tại" });
    }

    // Process uploaded images
    const image1 = req?.files?.image1?.[0];
    const image2 = req?.files?.image2?.[0];
    const image3 = req?.files?.image3?.[0];
    const image4 = req?.files?.image4?.[0];

    const images = [image1, image2, image3, image4].filter(
      (img) => img !== undefined
    );

    if (images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Cần ít nhất một hình ảnh" });
    }

    const imagesResults = await Promise.all(
      images.map(async (image) => {
        const result = await cloudinary.uploader.upload(image.path, {
          resource_type: "image",
          folder: "products",
        });
        return {
          url: result.secure_url.toString(),
          public_id: result.public_id.toString(),
        };
      })
    );

    // Construct and save product
    const product = new Product({
      name: value.name,
      description: value.description,
      price: Number(value.price),
      image: imagesResults,
      tags: value.tags,
    });

    await product.save();

    res
      .status(201)
      .json({ success: true, message: "Thêm sản phẩm thành công" });
  } catch (error) {
    console.error("Add product error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ: " + error.message });
  }
};
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, tags } = req.body;

    // Validate ID format
    if (!id || id.length !== 24) {
      return res
        .status(400)
        .json({ success: false, message: "ID sản phẩm không hợp lệ" });
    }

    // Parse tags if sent as JSON string
    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;

    const { error, value } = productSchema.validate(
      { name, description, price, tags: parsedTags },
      { abortEarly: false }
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Xác thực dữ liệu thất bại",
        errors: error.details.map((err) => err.message),
      });
    }

    // Validate that all tags exist
    const tagsExist = await Tag.countDocuments({ _id: { $in: value.tags } });
    if (tagsExist !== value.tags.length) {
      return res
        .status(400)
        .json({ success: false, message: "Một hoặc nhiều tag không tồn tại" });
    }

    // Find existing product
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    // Process uploaded images if any
    const image1 = req?.files?.image1?.[0];
    const image2 = req?.files?.image2?.[0];
    const image3 = req?.files?.image3?.[0];
    const image4 = req?.files?.image4?.[0];

    const newImages = [image1, image2, image3, image4].filter(
      (img) => img !== undefined
    );

    let imagesResults = product.image; // Keep existing images by default

    // If new images are uploaded, delete old ones and upload new
    if (newImages.length > 0) {
      // Delete old images from Cloudinary
      await Promise.all(
        product.image.map(async (img) => {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        })
      );

      // Upload new images
      imagesResults = await Promise.all(
        newImages.map(async (image) => {
          const result = await cloudinary.uploader.upload(image.path, {
            resource_type: "image",
            folder: "products",
          });
          return {
            url: result.secure_url.toString(),
            public_id: result.public_id.toString(),
          };
        })
      );
    }

    // Update product
    product.name = value.name;
    product.description = value.description;
    product.price = Number(value.price);
    product.image = imagesResults;
    product.tags = value.tags;

    await product.save();

    res
      .status(200)
      .json({ success: true, message: "Cập nhật sản phẩm thành công" });
  } catch (error) {
    console.error("Edit product error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ: " + error.message });
  }
};

// Function for Products list using _id keyset pagination
const listProducts = async (req, res) => {
  try {
    const { lastId, limit } = req.query;
    const queryLimit = parseInt(limit) || 10;

    const query = lastId
      ? { _id: { $lt: lastId } } // Fetch older than last seen ID
      : {};

    const products = await Product.find(query)
      .sort({ _id: -1 }) // Newest first by ObjectId
      .limit(queryLimit)
      .select("name price description image tags")
      .populate("tags", "name");

    if (!products || products.length === 0) {
      return res.status(200).json({
        success: true,
        products: [],
        hasMore: false,
      });
    }

    const nextCursor = products[products.length - 1]._id;

    res.status(200).json({
      success: true,
      products,
      hasMore: true,
      nextCursor, // Use this as ?lastId in next fetch
    });
  } catch (error) {
    console.error("List Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.",
    });
  }
};

// Function for remove product
const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || id.length !== 24) {
      return res
        .status(400)
        .json({ success: false, message: "ID sản phẩm không hợp lệ" });
    }

    // Find and delete the product
    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    // Delete each image from Cloudinary
    await Promise.all(
      product.image.map(async (img) => {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      })
    );
    await product.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Remove Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể xóa sản phẩm. Vui lòng thử lại sau.",
    });
  }
};

// Function for single product info
const singleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format (MongoDB ObjectId length is 24 characters)
    if (!id || id.length !== 24) {
      return res
        .status(400)
        .json({ success: false, message: "ID sản phẩm không hợp lệ" });
    }

    const product = await Product.findById(id).populate("tags", "name");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Single Product Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Không thể tải thông tin sản phẩm" });
  }
};

// Function to edit product

export { addProduct, listProducts, removeProduct, singleProduct, editProduct };
