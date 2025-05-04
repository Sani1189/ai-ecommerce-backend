import { type NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import Product from "@/models/Product"
import Order from "@/models/Order"
import Review from "@/models/Review"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import mongoose from "mongoose"

const logger = createLogger("DashboardAPI")

// Get ChatQuery model if it exists
const ChatQuery = mongoose.models.ChatQuery
const Newsletter = mongoose.models.Newsletter

export const GET = asyncHandler(async (req: NextRequest) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  // Get current date and date ranges
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const previousThirtyDaysAgo = new Date(thirtyDaysAgo)
  previousThirtyDaysAgo.setDate(previousThirtyDaysAgo.getDate() - 30)

  // Get total counts
  const totalUsers = await User.countDocuments()
  const totalProducts = await Product.countDocuments()
  const totalOrders = await Order.countDocuments()
  const totalReviews = await Review.countDocuments()

  // Get new users in last 30 days
  const newUsers = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  })

  // Get new users in previous 30 days for growth calculation
  const previousPeriodNewUsers = await User.countDocuments({
    createdAt: { $gte: previousThirtyDaysAgo, $lt: thirtyDaysAgo },
  })

  // Calculate user growth rate
  const userGrowthRate =
    previousPeriodNewUsers > 0 ? ((newUsers - previousPeriodNewUsers) / previousPeriodNewUsers) * 100 : 0

  // Get revenue stats for current period
  const currentPeriodOrders = await Order.find({
    createdAt: { $gte: thirtyDaysAgo },
  })

  const currentPeriodRevenue = currentPeriodOrders.reduce((sum, order) => sum + order.total, 0)

  // Get revenue stats for previous period
  const previousPeriodOrders = await Order.find({
    createdAt: { $gte: previousThirtyDaysAgo, $lt: thirtyDaysAgo },
  })

  const previousPeriodRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.total, 0)

  // Calculate revenue growth rate
  const revenueGrowthRate =
    previousPeriodRevenue > 0 ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 : 0

  // Get all orders for total revenue
  const allOrders = await Order.find()
  const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0)

  // Get recent orders
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email")

  // Get top selling products
  const topProducts = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        name: 1,
        totalSold: 1,
        revenue: 1,
        category: "$productDetails.category",
        image: { $arrayElemAt: ["$productDetails.images.url", 0] },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ])

  // Get order status distribution
  const orderStatusStats = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        revenue: { $sum: "$total" },
      },
    },
    { $sort: { count: -1 } },
  ])

  // Get revenue by category
  const revenueByCategory = await Order.aggregate([
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$productInfo.category",
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        count: { $sum: "$items.quantity" },
      },
    },
    { $match: { _id: { $ne: null } } },
    { $sort: { revenue: -1 } },
  ])

  // Get monthly sales for the last 6 months
  const sixMonthsAgo = new Date(now)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        sales: { $sum: "$total" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ])

  // Format monthly sales for chart
  const formattedMonthlySales = monthlySales.map((item) => {
    const date = new Date(item._id.year, item._id.month - 1, 1)
    return {
      month: date.toLocaleString("default", { month: "short" }),
      year: item._id.year,
      sales: item.sales,
      count: item.count,
    }
  })

  // Get daily signups for the last 30 days
  const dailySignups = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ])

  // Format daily signups for chart
  const formattedDailySignups = dailySignups.map((item) => {
    const date = new Date(item._id.year, item._id.month - 1, item._id.day)
    return {
      date: date.toISOString().split("T")[0],
      count: item.count,
    }
  })

  // Get low stock products
  const lowStockThreshold = 10
  const lowStockProducts = await Product.find({
    stock: { $lte: lowStockThreshold, $gt: 0 },
  })
    .sort({ stock: 1 })
    .limit(10)
    .select("name stock category price")

  // Get out of stock products
  const outOfStockProducts = await Product.countDocuments({
    stock: 0,
  })

  // Get chatbot stats if model exists
  let chatbotStats = null
  if (ChatQuery) {
    const totalQueries = await ChatQuery.countDocuments()
    const queriesLast30Days = await ChatQuery.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    })

    // Get intent distribution
    const intentDistribution = await ChatQuery.aggregate([
      {
        $group: {
          _id: "$intent",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])

    chatbotStats = {
      totalQueries,
      queriesLast30Days,
      intentDistribution,
    }
  }

  // Get newsletter stats if model exists
  let newsletterStats = null
  if (Newsletter) {
    const totalSubscribers = await Newsletter.countDocuments({ isActive: true })
    const newSubscribers = await Newsletter.countDocuments({
      subscribedAt: { $gte: thirtyDaysAgo },
      isActive: true,
    })
    const unsubscribes = await Newsletter.countDocuments({
      unsubscribedAt: { $gte: thirtyDaysAgo },
    })

    newsletterStats = {
      totalSubscribers,
      newSubscribers,
      unsubscribes,
    }
  }

  logger.info(`Dashboard stats retrieved by admin: ${authResult.user._id}`)

  return NextResponse.json({
    success: true,
    stats: {
      counts: {
        users: totalUsers,
        products: totalProducts,
        orders: totalOrders,
        reviews: totalReviews,
        outOfStockProducts,
      },
      growth: {
        newUsers,
        userGrowthRate,
        revenueGrowthRate,
      },
      revenue: {
        total: totalRevenue,
        last30Days: currentPeriodRevenue,
        average: allOrders.length > 0 ? totalRevenue / allOrders.length : 0,
      },
      recentOrders,
      topProducts,
      orderStatusStats,
      revenueByCategory,
      monthlySales: formattedMonthlySales,
      dailySignups: formattedDailySignups,
      lowStockProducts,
      chatbotStats,
      newsletterStats,
    },
  })
})
