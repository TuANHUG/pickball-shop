import TagGroup from "../models/tagGroupModel.js";
import Tag from "../models/tagModel.js";
import { tagGroupSchema } from "../validation/tagGroupValidation.js";

export const createTagGroup = async (req, res) => {
  try {
    const { error } = tagGroupSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const { name, description } = req.body;

    const existingTagGroup = await TagGroup.findOne({ name });
    if (existingTagGroup) {
      return res
        .status(400)
        .json({ success: false, message: "Tag group đã tồn tại" });
    }

    const tagGroup = new TagGroup({ name, description });
    await tagGroup.save();

    res.status(201).json({
      success: true,
      message: "Tạo tag group thành công",
      data: tagGroup,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllTagGroups = async (req, res) => {
  try {
    const tagGroups = await TagGroup.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tagGroups });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTagGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const tagGroup = await TagGroup.findById(id);

    if (!tagGroup) {
      return res
        .status(404)
        .json({ success: false, message: "Tag group không tồn tại" });
    }
    res.status(200).json({ success: true, data: tagGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateTagGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = tagGroupSchema.validate(req.body);

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { name, description } = req.body;

    // Kiểm tra trùng tên tag group
    const existingTagGroup = await TagGroup.findOne({ name, _id: { $ne: id } });
    if (existingTagGroup) {
      return res.status(400).json({
        success: false,
        message: "Tag group đã tồn tại",
      });
    }

    const tagGroup = await TagGroup.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!tagGroup) {
      return res
        .status(404)
        .json({ success: false, message: "Tag group không tồn tại" });
    }

    res.status(200).json({
      success: true,
      message: "Tag group cập nhật thành công",
      data: tagGroup,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteTagGroup = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra tag group có tồn tại không
    const tagGroup = await TagGroup.findById(id);
    if (!tagGroup) {
      return res
        .status(404)
        .json({ success: false, message: "Tag group không tồn tại" });
    }

    // Kiểm tra tag group có đang được tham chiếu bởi tag nào không
    const tagsUsingThisGroup = await Tag.countDocuments({ tag_group_id: id });
    if (tagsUsingThisGroup > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa tag group này vì đang có tag sử dụng`,
      });
    }

    await TagGroup.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Xóa tag group thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
