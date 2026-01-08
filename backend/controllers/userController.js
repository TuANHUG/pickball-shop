import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const createToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Route for user login
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Tất cả các trường là bắt buộc" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    // Compare password
    const isMatchedPassword = await bcrypt.compare(password, user.password);
    if (!isMatchedPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Thông tin đăng nhập không hợp lệ" });
    }

    // Issue JWT token
    const token = createToken(user._id);
    // Send via HTTP-only cookie
    res.cookie("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res
      .status(200)
      .json({ success: true, user: user._id, message: "Đăng nhập thành công" });
  } catch (error) {
    console.error("User Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra. Vui lòng thử lại sau.",
    });
  }
};

// Route for user registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Tất cả các trường là bắt buộc" });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập email hợp lệ" });
    }

    // if (!validator.isStrongPassword(password)) {
    //     return res.status(400).json({ success: false, message: 'Please enter a strong password' });
    // }

    // Check for existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Người dùng đã tồn tại" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    // Generate token
    const token = createToken(user._id);

    // Send via HTTP-only cookie
    res.cookie("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res
      .status(200)
      .json({ success: true, user: user._id, message: "Đăng ký thành công" });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra. Vui lòng thử lại sau.",
    });
  }
};

const getUserData = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Chưa xác thực" });
  }

  return res.status(200).json({
    success: true,
    message: "Người dùng đã được xác thực",
    user: { 
      _id: req.user._id, 
      name: req.user.name,     
      email: req.user.email,
      canComment: req.user.canComment 
    },
  });
};

const userLogout = (req, res) => {
  res.clearCookie("user_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  res.status(200).json({ success: true, message: "Đăng xuất thành công" });
};

// Route to get all users with statistics, pagination, search, and sorting
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "userId",
          as: "orders",
        },
      },
      {
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { "orders.phone": { $regex: search, $options: "i" } }, // Search in orders' phone
          ],
        },
      },
      {
        $addFields: {
          deliveredOrders: {
            $filter: {
              input: "$orders",
              as: "order",
              cond: { $eq: ["$$order.status", "Delivered"] },
            },
          },
          phone: { $ifNull: [{ $arrayElemAt: ["$orders.phone", -1] }, "N/A"] }, // Get latest phone or N/A. Warning: orders might not be sorted by date here unless we sort them. Assuming reliable insertion order or just taking one.
        },
      },
      {
        $addFields: {
          totalOrders: { $size: "$deliveredOrders" },
          totalSpent: { $sum: "$deliveredOrders.amount" },
          totalProducts: {
            $sum: {
              $map: {
                input: "$deliveredOrders",
                as: "order",
                in: { $sum: "$$order.items.quantity" },
              },
            },
          },
        },
      },
      {
        $project: {
          orders: 0,
          deliveredOrders: 0,
          password: 0,
        },
      },
      {
        $sort: { [sortBy]: sortOrder },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const result = await User.aggregate(pipeline);

    const users = result[0].data;
    const totalUsers = result[0].metadata[0] ? result[0].metadata[0].total : 0;
    const totalPages = Math.ceil(totalUsers / limit);

    res
      .status(200)
      .json({
        success: true,
        users,
        totalUsers,
        totalPages,
        currentPage: page,
      });
  } catch (error) {
    console.error("Get All Users error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Route to delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;
    await User.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Xóa người dùng thành công" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Route to update user status (canComment, canChat)
const updateUserStatus = async (req, res) => {
  try {
    const { userId, canComment, canChat } = req.body;
    const updateData = {};
    if (typeof canComment !== "undefined") updateData.canComment = canComment;
    if (typeof canChat !== "undefined") updateData.canChat = canChat;

    await User.findByIdAndUpdate(userId, updateData);
    res
      .status(200)
      .json({ success: true, message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  userLogin,
  registerUser,
  getUserData,
  userLogout,
  getAllUsers,
  deleteUser,
  updateUserStatus,
};
