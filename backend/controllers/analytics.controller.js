import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

export const getAnalyticsData = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const salesData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: {$sum: 1},
          totalRevenue: {$sum: "$totalAmount"}
        }
      }
    ]);

    const {totalSales, totalRevenue} = salesData[0] || {totalSales: 0, totalRevenue: 0};

    return {
      users: totalUsers,
      products: totalProducts,
      sales: totalSales,
      revenue: totalRevenue
    };
  } catch (error) {
    console.error("Error in getAnalyticsData:", error);
    return {
      users: 0,
      products: 0,
      sales: 0,
      revenue: 0
    };
  }
}

export const getSalesData = async (startDate, endDate) => {
  try {
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: {$gte: startDate, $lt: endDate}
        }
      },
      {
        $group: {
          _id: {$dateToString: {format: "%Y-%m-%d", date: "$createdAt"}},
          totalDailySales: {$sum: 1},
          totalDailyRevenue: {$sum: "$totalAmount"}
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ]);

    const dateArray = getDatesInRange(startDate, endDate);

    return dateArray.map(date => {
      const formattedDate = date.toISOString().split('T')[0];
      const foundData = salesData.find(data => data._id === formattedDate);
      return {
        name: formattedDate, // Changed from 'date' to 'name' to match chart expectations
        sales: foundData ? foundData.totalDailySales : 0, // Changed from 'totalDailySales' to 'sales'
        revenue: foundData ? foundData.totalDailyRevenue : 0 // Changed from 'totalDailyRevenue' to 'revenue'
      };
    });
  } catch (error) {
    console.error("Error in getSalesData:", error);
    return []; // Return empty array instead of throwing error
  }
}

function getDatesInRange(start, end) {
  const dates = [];
  const endDate = new Date(end);
  let currentDate = new Date(start);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}