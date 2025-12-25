import InventoryLog from "../models/inventoryLogModel.js";

// List inventory logs
const listInventoryLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { type, created_by, startDate, endDate } = req.query;
    const query = {};

    if (type && type !== "all") {
      query.type = type;
    }

    if (created_by) {
      query.created_by = { $regex: created_by, $options: "i" };
    }

    if (startDate || endDate) {
      query.created_at = {};
      if (startDate) {
        query.created_at.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.created_at.$lte = end;
      }
    }

    const total = await InventoryLog.countDocuments(query);
    const logs = await InventoryLog.find(query)
      .populate("items.product_id")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      logs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLogs: total,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Create inventory log
const createInventoryLog = async (req, res) => {
  try {
    const { type, items, created_by } = req.body;

    const newLog = new InventoryLog({
      type,
      items,
      created_by,
    });

    await newLog.save();
    res.json({ success: true, message: "Inventory Log Created" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { listInventoryLogs, createInventoryLog };
