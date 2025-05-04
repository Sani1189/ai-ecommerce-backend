import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import { cacheWrapper } from "@/lib/redis"

const logger = createLogger("ProductsAPI")

// GET compare products
export const GET = asyncHandler(async (req: NextRequest) => {
  await dbConnect()

  const url = new URL(req.url)
  const productIds = url.searchParams.get("ids")?.split(",") || []

  if (!productIds.length) {
    return NextResponse.json({ success: false, message: "No product IDs provided" }, { status: 400 })
  }

  if (productIds.length > 4) {
    return NextResponse.json({ success: false, message: "Maximum 4 products can be compared at once" }, { status: 400 })
  }

  // Use cache wrapper to get products
  const cacheKey = `compare:${productIds.sort().join(",")}`

  const products = await cacheWrapper(
    cacheKey,
    async () => {
      const products = await Product.find({
        _id: { $in: productIds },
        isPublished: true,
      })

      return products
    },
    60 * 15, // Cache for 15 minutes
  )

  // Extract all unique specification keys across all products
  const allSpecKeys = new Set<string>()
  products.forEach((product) => {
    if (product.specifications) {
      for (const key of product.specifications.keys()) {
        allSpecKeys.add(key)
      }
    }
  })

  // Create comparison data structure
  const comparisonData = {
    products,
    specificationKeys: Array.from(allSpecKeys),
  }

  logger.info(`Compared ${products.length} products`)

  return NextResponse.json({
    success: true,
    comparison: comparisonData,
  })
})

// POST update product comparison list
export const POST = asyncHandler(async (req: NextRequest) => {
  await dbConnect()

  const { productId, compareWithIds } = await req.json()

  if (!productId) {
    return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 })
  }

  if (!Array.isArray(compareWithIds)) {
    return NextResponse.json({ success: false, message: "Compare with IDs must be an array" }, { status: 400 })
  }

  // Update product's compareWith field
  const product = await Product.findByIdAndUpdate(productId, { compareWith: compareWithIds }, { new: true })

  if (!product) {
    return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
  }

  logger.info(`Updated comparison list for product: ${productId}`)

  return NextResponse.json({
    success: true,
    product,
  })
})
