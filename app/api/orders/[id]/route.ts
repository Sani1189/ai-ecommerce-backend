import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Order from "@/models/Order"
import { isAdmin, isAuthenticated } from "@/lib/auth"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { z } from "zod"
import { validate } from "@/lib/middleware/validator"
import { createLogger } from "@/lib/logger"
import { ApiError } from "@/lib/middleware/errorHandler"
import { NotificationService } from "@/lib/notifications"

const logger = createLogger("OrdersAPI")

// Order update validation schema
const orderUpdateSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  trackingNumber: z.string().optional(),
})

// GET a single order
export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  // Check if user is authenticated
  const authResult = await isAuthenticated(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  const { id } = params

  const order = await Order.findById(id).populate("user", "name email")

  if (!order) {
    logger.warn(`Order not found: ${id}`, { userId: authResult.user._id })
    throw new ApiError("Order not found", 404)
  }

  // Only allow admin or order owner to access order details
  if (authResult.user.role !== "admin" && order.user._id.toString() !== authResult.user._id.toString()) {
    logger.warn(`Unauthorized access attempt to order: ${id}`, { userId: authResult.user._id })
    throw new ApiError("Not authorized to access this order", 403)
  }

  logger.info(`Order retrieved: ${id}`, { userId: authResult.user._id })

  return NextResponse.json({
    success: true,
    order,
  })
})

// PUT update order status (admin only)
export const PUT = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  const { id } = params

  // Validate request body
  const validationResult = await validate(orderUpdateSchema)(req)
  if (validationResult instanceof NextResponse) {
    return validationResult
  }

  const { status, trackingNumber } = validationResult.data

  // Find and update order
  const order = await Order.findByIdAndUpdate(
    id,
    { status, trackingNumber },
    { new: true, runValidators: true },
  ).populate("user", "name email")

  if (!order) {
    logger.warn(`Order not found for update: ${id}`, { userId: authResult.user._id })
    throw new ApiError("Order not found", 404)
  }

  // Send notification to user about order status change
  await NotificationService.createNotification(
    order.user._id.toString(),
    "order_status",
    `Order ${status}`,
    `Your order #${order._id.toString().slice(-6)} has been ${status}`,
    {
      orderId: order._id,
      status,
      trackingNumber,
    },
  )

  logger.info(`Order status updated: ${id} to ${status}`, {
    userId: authResult.user._id,
    orderId: id,
  })

  return NextResponse.json({
    success: true,
    order,
  })
})
