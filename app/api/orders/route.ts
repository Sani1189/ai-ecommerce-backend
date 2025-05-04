import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Order from "@/models/Order"
import { isAuthenticated } from "@/lib/auth"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { z } from "zod"
import { validate } from "@/lib/middleware/validator"
import { createLogger } from "@/lib/logger"

const logger = createLogger("OrdersAPI")

// Order validation schema
const orderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.string(),
        name: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
        image: z.string().optional(),
      }),
    )
    .min(1, "At least one item is required"),
  shippingInfo: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string(),
    phone: z.string(),
  }),
  paymentInfo: z.object({
    id: z.string().optional(),
    status: z.string().optional(),
    method: z.enum(["stripe", "paypal", "cod"]),
  }),
  subtotal: z.number().positive(),
  tax: z.number().min(0),
  shipping: z.number().min(0),
  discount: z.number().min(0).optional(),
  total: z.number().positive(),
  couponApplied: z.string().optional(),
  notes: z.string().optional(),
})

// GET all orders (admin) or user orders (user)
export const GET = asyncHandler(async (req: NextRequest) => {
  // Check if user is authenticated
  const authResult = await isAuthenticated(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  const url = new URL(req.url)

  // Pagination
  const page = Number.parseInt(url.searchParams.get("page") || "1")
  const limit = Number.parseInt(url.searchParams.get("limit") || "10")
  const skip = (page - 1) * limit

  // Filtering
  const status = url.searchParams.get("status")

  // Build filter object
  const filter: any = {}

  // If not admin, only show user's orders
  if (authResult.user.role !== "admin") {
    filter.user = authResult.user._id
  }

  if (status) filter.status = status

  // Sorting
  const sortField = url.searchParams.get("sortField") || "createdAt"
  const sortOrder = url.searchParams.get("sortOrder") || "desc"
  const sort: any = {}
  sort[sortField] = sortOrder === "asc" ? 1 : -1

  // Execute query
  const orders = await Order.find(filter).populate("user", "name email").sort(sort).skip(skip).limit(limit)

  // Get total count for pagination
  const total = await Order.countDocuments(filter)

  logger.info(`Retrieved ${orders.length} orders`, {
    userId: authResult.user._id,
    isAdmin: authResult.user.role === "admin",
  })

  return NextResponse.json({
    success: true,
    orders,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  })
})

// POST create a new order
export const POST = asyncHandler(async (req: NextRequest) => {
  // Check if user is authenticated
  const authResult = await isAuthenticated(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  // Validate request body
  const validationResult = await validate(orderSchema)(req)
  if (validationResult instanceof NextResponse) {
    return validationResult
  }

  const orderData = validationResult.data

  // Set user ID from authenticated user
  orderData.user = authResult.user._id

  // Create order
  const order = await Order.create(orderData)

  logger.info(`New order created: ${order._id}`, {
    userId: authResult.user._id,
    orderTotal: orderData.total,
  })

  return NextResponse.json(
    {
      success: true,
      order,
    },
    { status: 201 },
  )
})
