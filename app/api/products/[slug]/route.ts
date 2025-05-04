import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import { isAdmin } from "@/lib/auth"
import slugify from "slugify"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { ApiError } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import { cacheWrapper, clearCacheByPattern } from "@/lib/redis"

const logger = createLogger("ProductAPI")

// GET a single product by slug
export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { slug: string } }) => {
  await dbConnect()

  const { slug } = await params

  // Use cache wrapper to get product
  const product = await cacheWrapper(
    `product:${slug}`,
    async () => {
      const product = await Product.findOne({ slug })
      if (!product) {
        throw new ApiError("Product not found", 404)
      }
      return product
    },
    60 * 60, // Cache for 1 hour
  )

  logger.info(`Product retrieved: ${slug}`)

  return NextResponse.json({
    success: true,
    product,
  })
})

// PUT update a product (admin only)
export const PUT = asyncHandler(async (req: NextRequest, { params }: { params: { slug: string } }) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  const { slug } = params
  const updateData = await req.json()

  // If name is updated, update slug as well
  if (updateData.name && !updateData.slug) {
    updateData.slug = slugify(updateData.name, { lower: true })
  }

  // Find and update product
  const product = await Product.findOneAndUpdate({ slug }, updateData, { new: true, runValidators: true })

  if (!product) {
    throw new ApiError("Product not found", 404)
  }

  // Clear product caches
  await clearCacheByPattern(`product:${slug}`)
  await clearCacheByPattern(`product:${updateData.slug}`)
  await clearCacheByPattern("products:*")

  logger.info(`Product updated: ${slug} -> ${product.slug}`)

  return NextResponse.json({
    success: true,
    product,
  })
})

// DELETE a product (admin only)
export const DELETE = asyncHandler(async (req: NextRequest, { params }: { params: { slug: string } }) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  const { slug } = params

  const product = await Product.findOneAndDelete({ slug })

  if (!product) {
    throw new ApiError("Product not found", 404)
  }

  // Clear product caches
  await clearCacheByPattern(`product:${slug}`)
  await clearCacheByPattern("products:*")

  logger.info(`Product deleted: ${slug}`)

  return NextResponse.json({
    success: true,
    message: "Product deleted successfully",
  })
})
