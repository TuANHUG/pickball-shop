import Order from "../models/orderModel.js";

const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate, productSort = "desc" } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Ensure end date includes the full day
    end.setHours(23, 59, 59, 999);

    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          payment: true,
          status: { $ne: "Cancelled" },
        },
      },
      {
        $project: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: 1,
          items: 1,
        },
      },
      {
        $group: {
          _id: "$date",
          totalSales: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
          totalProducts: { $sum: { $sum: "$items.quantity" } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get Product Stats
    const sortDirection = productSort === "asc" ? 1 : -1;
    const productStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          payment: true,
          status: { $ne: "Cancelled" },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          quantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { quantity: sortDirection } },
      { $limit: 10 },
    ]);

    // Fill in missing dates with 0
    const result = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayStats = stats.find((s) => s._id === dateStr);

      result.push({
        date: dateStr,
        totalSales: dayStats ? dayStats.totalSales : 0,
        totalOrders: dayStats ? dayStats.totalOrders : 0,
        totalProducts: dayStats ? dayStats.totalProducts : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({ success: true, data: result, productStats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getDashboardStats };
