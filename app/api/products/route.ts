import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import { isAdmin } from "@/lib/auth"
import slugify from "slugify"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { z } from "zod"
import { validate } from "@/lib/middleware/validator"
import { createLogger } from "@/lib/logger"
import { cacheWrapper, clearCacheByPattern } from "@/lib/redis"

const logger = createLogger("ProductsAPI")

// Product validation schema
const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name cannot exceed 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
  price: z.number().positive("Price must be positive"),
  category: z.enum(["electronics", "clothing", "furniture", "books", "toys", "beauty", "sports", "food", "other"], {
    errorMap: () => ({ message: "Invalid category" }),
  }),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  images: z
    .array(
      z.object({
        url: z.string().url("Image URL must be valid"),
        alt: z.string().optional(),
      }),
    )
    .min(1, "At least one image is required"),
  slug: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  features: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
})

// GET all products with pagination, filtering, and sorting
export const GET = asyncHandler(async (req: NextRequest) => {
  await dbConnect()
  logger.info("Fetching products")

  const url = new URL(req.url)

  // Pagination
  const page = Number.parseInt(url.searchParams.get("page") || "1")
  const limit = Number.parseInt(url.searchParams.get("limit") || "10")
  const skip = (page - 1) * limit

  // Filtering
  const category = url.searchParams.get("category")
  const minPrice = url.searchParams.get("minPrice")
  const maxPrice = url.searchParams.get("maxPrice")
  const search = url.searchParams.get("search")
  const featured = url.searchParams.get("featured")

  // Build filter object
  const filter: any = { isPublished: true }

  if (category) filter.category = category
  if (minPrice) filter.price = { ...filter.price, $gte: Number.parseFloat(minPrice) }
  if (maxPrice) filter.price = { ...filter.price, $lte: Number.parseFloat(maxPrice) }
  if (featured === "true") filter.isFeatured = true
  if (search) filter.$text = { $search: search }

  // Sorting
  const sortField = url.searchParams.get("sortField") || "createdAt"
  const sortOrder = url.searchParams.get("sortOrder") || "desc"
  const sort: any = {}
  sort[sortField] = sortOrder === "asc" ? 1 : -1

  // Create a cache key based on the query parameters
  const cacheKey = `products:${JSON.stringify({ filter, sort, skip, limit })}`

  // Use cache wrapper to get data
  const { products, total } = await cacheWrapper(
    cacheKey,
    async () => {
      // Execute query
      const products = await Product.find(filter).sort(sort).skip(skip).limit(limit)
      // Get total count for pagination
      const total = await Product.countDocuments(filter)
      return { products, total }
    },
    60 * 15, // Cache for 15 minutes
  )

  logger.info(`Found ${products.length} products`)

  return NextResponse.json({
    success: true,
    products,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  })
})

// POST create a new product (admin only)
export const POST = asyncHandler(async (req: NextRequest) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  // Validate request body
  const validationResult = await validate(productSchema)(req)
  if (validationResult instanceof NextResponse) {
    return validationResult
  }

  const productData = validationResult.data

  // Generate slug from name if not provided
  if (!productData.slug) {
    productData.slug = slugify(productData.name, { lower: true })
  }

  // Create product
  const product = await Product.create(productData)

  // Clear product cache
  await clearCacheByPattern("products:*")

  logger.info(`Created new product: ${product.name}`, { productId: product._id })

  return NextResponse.json(
    {
      success: true,
      product,
    },
    { status: 201 },
  )
})
