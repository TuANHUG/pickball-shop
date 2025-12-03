import Tag from "../models/tagModel.js";
import TagGroup from "../models/tagGroupModel.js";
import Product from "../models/productModel.js";
import { tagSchema } from "../validation/tagValidation.js";

export const createTag = async (req, res) => {
  try {
    const { error } = tagSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { name, tag_group_id, description } = req.body;

    // Check if tag group exists
    const tagGroup = await TagGroup.findById(tag_group_id);
    if (!tagGroup) {
      return res
        .status(404)
        .json({ success: false, message: "Tag group không tồn tại" });
    }

    // Check if tag already exists in this tag group
    const existingTag = await Tag.findOne({ name, tag_group_id });
    if (existingTag) {
      return res
        .status(400)
        .json({ success: false, message: "Tag đã tồn tại trong nhóm này" });
    }

    const tag = new Tag({ name, tag_group_id, description });
    await tag.save();

    res.status(201).json({
      success: true,
      message: "Tạo tag thành công",
      data: tag,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all tags
export const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find()
      .populate("tag_group_id", "name description")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tags });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get tags grouped by tag group
export const getTagsGrouped = async (req, res) => {
  try {
    const tagGroups = await TagGroup.find().sort({ createdAt: 1 });
    const tags = await Tag.find();

    const groupedData = tagGroups.map((group) => {
      const groupTags = tags.filter(
        (tag) => tag.tag_group_id.toString() === group._id.toString()
      );

      return {
        id: group._id,
        name: group.name,
        description: group.description,
        tags: groupTags.map((tag) => ({
          id: tag._id,
          name: tag.name,
          slug: tag.slug,
          description: tag.description,
        })),
      };
    });

    res.status(200).json({ success: true, data: groupedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get a single tag by ID
export const getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await Tag.findById(id).populate(
      "tag_group_id",
      "name description"
    );

    if (!tag) {
      return res
        .status(404)
        .json({ success: false, message: "Tag không tồn tại" });
    }

    res.status(200).json({ success: true, data: tag });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a tag
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = tagSchema.validate(req.body);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { name, tag_group_id, description } = req.body;

    // Check if tag group exists
    const tagGroup = await TagGroup.findById(tag_group_id);
    if (!tagGroup) {
      return res
        .status(404)
        .json({ success: false, message: "Tag group không tồn tại" });
    }

    // Check if another tag with the same name exists in this tag group
    const existingTag = await Tag.findOne({
      name,
      tag_group_id,
      _id: { $ne: id },
    });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: "Tag với tên này đã tồn tại trong nhóm",
      });
    }

    const tag = await Tag.findByIdAndUpdate(
      id,
      { name, tag_group_id, description },
      { new: true, runValidators: true }
    ).populate("tag_group_id", "name description");

    if (!tag) {
      return res
        .status(404)
        .json({ success: false, message: "Tag không tồn tại" });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật tag thành công",
      data: tag,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a tag
export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tag exists
    const tag = await Tag.findById(id);
    if (!tag) {
      return res
        .status(404)
        .json({ success: false, message: "Tag không tồn tại" });
    }

    // Check if any product is using this tag
    const productsUsingTag = await Product.countDocuments({
      tags: id,
    });

    if (productsUsingTag > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa tag này vì đang có ${productsUsingTag} sản phẩm đang sử dụng`,
      });
    }

    await Tag.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Xóa tag thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
