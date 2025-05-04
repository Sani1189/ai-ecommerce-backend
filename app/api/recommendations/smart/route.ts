import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import Order from "@/models/Order"
import { isAuthenticated } from "@/lib/auth"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import { cacheWrapper, incrementCounter, addToSortedSet } from "@/lib/redis"

const logger = createLogger("SmartRecommendationsAPI")

// GET smart personalized recommendations
export const GET = asyncHandler(async (req: NextRequest) => {
  // Check if user is authenticated (optional)
  const authResult = await isAuthenticated(req)
  const isLoggedIn = authResult.success

  await dbConnect()

  const url = new URL(req.url)
  const productId = url.searchParams.get("productId") // For item-based recommendations
  const limit = Number.parseInt(url.searchParams.get("limit") || "8")

  let recommendations: any[] = []
  let cacheKey = ""
  let recommendationType = "popular" // Default

  // Track recommendation request for analytics
  await incrementCounter("analytics:recommendations:requests")

  // If user is logged in, we can do user-based collaborative filtering
  if (isLoggedIn) {
    const userId = authResult.user._id.toString()
    recommendationType = "collaborative"
    cacheKey = `recommendations:smart:user:${userId}:${limit}`

    recommendations = await cacheWrapper(
      cacheKey,
      async () => {
        // Get user's purchase history
        const userOrders = await Order.find({ user: userId })

        // Extract product IDs from orders
        const purchasedProductIds = userOrders.flatMap((order) => order.items.map((item) => item.product.toString()))

        if (purchasedProductIds.length === 0) {
          // If no purchase history, fall back to popular products
          return await Product.find({
            isPublished: true,
            stock: { $gt: 0 },
          })
            .sort({ reviewCount: -1, rating: -1 })
            .limit(limit)
        }

        // Find users who purchased the same products
        const similarUserOrders = await Order.find({
          user: { $ne: userId },
          "items.product": { $in: purchasedProductIds },
        })

        // Extract user IDs from similar orders
        const similarUserIds = [...new Set(similarUserOrders.map((order) => order.user.toString()))]

        if (similarUserIds.length === 0) {
          // If no similar users, fall back to category-based recommendations
          const purchasedProducts = await Product.find({
            _id: { $in: purchasedProductIds },
          })

          const categories = [...new Set(purchasedProducts.map((p) => p.category))]

          return await Product.find({
            category: { $in: categories },
            _id: { $nin: purchasedProductIds },
            isPublished: true,
            stock: { $gt: 0 },
          })
            .sort({ rating: -1 })
            .limit(limit)
        }

        // Find products purchased by similar users but not by the current user
        const similarUserProducts = await Order.find({
          user: { $in: similarUserIds },
        })

        // Extract product IDs from similar user orders
        const similarProductIds = similarUserProducts.flatMap((order) =>
          order.items.map((item) => item.product.toString()).filter((id) => !purchasedProductIds.includes(id)),
        )

        // Count product occurrences to find most common products among similar users
        const productCounts = similarProductIds.reduce(
          (acc, id) => {
            acc[id] = (acc[id] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )

        // Sort by frequency
        const sortedProductIds = Object.entries(productCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([id]) => id)
          .slice(0, limit)

        if (sortedProductIds.length > 0) {
          return await Product.find({
            _id: { $in: sortedProductIds },
            isPublished: true,
            stock: { $gt: 0 },
          })
        }

        // Fallback to popular products if no recommendations found
        return await Product.find({
          isPublished: true,
          stock: { $gt: 0 },
        })
          .sort({ reviewCount: -1, rating: -1 })
          .limit(limit)
      },
      60 * 30, // Cache for 30 minutes
    )
  }
  // If product ID is provided, do item-based collaborative filtering
  else if (productId) {
    recommendationType = "item-based"
    cacheKey = `recommendations:smart:item:${productId}:${limit}`

    // Track product recommendation view
    await addToSortedSet("analytics:recommendations:products", productId, 1, 60 * 60 * 24 * 30) // 30 days

    recommendations = await cacheWrapper(
      cacheKey,
      async () => {
        // Get the current product
        const currentProduct = await Product.findById(productId)

        if (!currentProduct) {
          return []
        }

        // Find orders containing this product
        const orders = await Order.find({
          "items.product": productId,
        })

        // Extract all other products from these orders
        const otherProductIds = orders.flatMap((order) =>
          order.items.filter((item) => item.product.toString() !== productId).map((item) => item.product.toString()),
        )

        // Count occurrences of each product
        const productCounts = otherProductIds.reduce(
          (acc, id) => {
            acc[id] = (acc[id] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )

        // Sort by frequency
        const sortedProductIds = Object.entries(productCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([id]) => id)
          .slice(0, limit)

        if (sortedProductIds.length > 0) {
          return await Product.find({
            _id: { $in: sortedProductIds },
            isPublished: true,
            stock: { $gt: 0 },
          })
        }

        // Fallback to products in the same category
        return await Product.find({
          _id: { $ne: productId },
          category: currentProduct.category,
          isPublished: true,
          stock: { $gt: 0 },
        })
          .sort({ rating: -1 })
          .limit(limit)
      },
      60 * 60, // Cache for 1 hour
    )
  }
  // Otherwise, return trending products based on review count and rating
  else {
    recommendationType = "trending"
    cacheKey = `recommendations:smart:trending:${limit}`

    recommendations = await cacheWrapper(
      cacheKey,
      async () => {
        return await Product.find({
          isPublished: true,
          stock: { $gt: 0 },
          reviewCount: { $gt: 0 },
        })
          .sort({ reviewCount: -1, rating: -1 })
          .limit(limit)
      },
      60 * 15, // Cache for 15 minutes
    )
  }

  logger.info(`Retrieved ${recommendations.length} ${recommendationType} recommendations`)

  return NextResponse.json({
    success: true,
    recommendationType,
    recommendations,
  })
})
