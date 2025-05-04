import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import FlashSale from "@/models/FlashSale"
import { isAdmin } from "@/lib/auth"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import { cacheWrapper, clearCacheByPattern } from "@/lib/redis"

const logger = createLogger("FlashSalesAPI")

// GET active flash sales
export const GET = asyncHandler(async (req: NextRequest) => {
  await dbConnect()
  logger.info("Fetching flash sales")

  // Create a cache key
  const cacheKey = "sales:flash:active"

  // Use cache wrapper to get data
  const flashSales = await cacheWrapper(
    cacheKey,
    async () => {
      // Find active flash sales
      const now = new Date()
      const activeSales = await FlashSale.find({
        startTime: { $lte: now },
        endTime: { $gt: now },
        isActive: true,
      })

      if (activeSales.length === 0) {
        return []
      }

      // Process each sale
      const processedSales = await Promise.all(
        activeSales.map(async (sale) => {
          // Get the products in the flash sale
          const products = await Product.find({
            _id: { $in: sale.productIds },
            isPublished: true,
            stock: { $gt: 0 },
          })

          // Apply the discount to each product
          const saleProducts = products.map((product) => {
            const discountedPrice = Math.round(product.price * (1 - sale.discountPercentage / 100))

            return {
              _id: product._id,
              name: product.name,
              slug: product.slug,
              originalPrice: product.price,
              discountedPrice,
              savings: product.price - discountedPrice,
              discountPercentage: sale.discountPercentage,
              category: product.category,
              images: product.images,
              stock: product.stock,
            }
          })

          return {
            _id: sale._id,
            name: sale.name,
            description: sale.description,
            discountPercentage: sale.discountPercentage,
            startTime: sale.startTime,
            endTime: sale.endTime,
            products: saleProducts,
            timeRemaining: Math.max(0, sale.endTime.getTime() - now.getTime()),
          }
        }),
      )

      return processedSales
    },
    60, // Cache for 1 minute since flash sales are time-sensitive
  )

  logger.info(`Found ${flashSales.length} active flash sales`)

  return NextResponse.json({
    success: true,
    flashSales,
  })
})

// POST create a new flash sale (admin only)
export const POST = asyncHandler(async (req: NextRequest) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  const data = await req.json()
  const { name, description, productIds, discountPercentage, durationMinutes } = data

  if (!name || !productIds || !Array.isArray(productIds) || !discountPercentage || !durationMinutes) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid flash sale data. Required fields: name, productIds, discountPercentage, durationMinutes",
      },
      { status: 400 },
    )
  }

  // Get the products
  const products = await Product.find({
    _id: { $in: productIds },
  })

  if (products.length !== productIds.length) {
    return NextResponse.json(
      {
        success: false,
        message: "One or more products not found",
      },
      { status: 404 },
    )
  }

  // Create the flash sale
  const now = new Date()
  const endTime = new Date(now.getTime() + durationMinutes * 60000)

  const flashSale = new FlashSale({
    name,
    description,
    productIds,
    discountPercentage,
    startTime: now,
    endTime,
    isActive: true,
  })

  await flashSale.save()

  // Clear the flash sales cache
  await clearCacheByPattern("sales:flash:*")

  logger.info(`Created new flash sale: ${name}`)

  return NextResponse.json(
    {
      success: true,
      flashSale,
    },
    { status: 201 },
  )
})
