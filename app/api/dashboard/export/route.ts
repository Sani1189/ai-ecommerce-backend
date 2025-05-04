import { type NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import Order from "@/models/Order"
import User from "@/models/User"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import { Parser } from "json2csv"

const logger = createLogger("DashboardAPI")

export const GET = asyncHandler(async (req: NextRequest) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  const url = new URL(req.url)
  const type = url.searchParams.get("type") || "inventory"

  let data: any[] = []
  let fields: string[] = []
  let filename = ""

  switch (type) {
    case "inventory":
      data = await Product.find().select("name price stock category brand subcategory createdAt updatedAt")
      fields = ["_id", "name", "price", "stock", "category", "brand", "subcategory", "createdAt", "updatedAt"]
      filename = "inventory"
      break

    case "orders":
      data = await Order.find().populate("user", "name email")
      // Transform data to flatten user info
      data = data.map((order) => ({
        _id: order._id,
        userName: order.user?.name || "Guest",
        userEmail: order.user?.email || "N/A",
        status: order.status,
        total: order.total,
        items: order.items.length,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }))
      fields = ["_id", "userName", "userEmail", "status", "total", "items", "createdAt", "updatedAt"]
      filename = "orders"
      break

    case "users":
      data = await User.find().select("name email role createdAt")
      fields = ["_id", "name", "email", "role", "createdAt"]
      filename = "users"
      break

    default:
      return NextResponse.json({ success: false, message: "Invalid export type" }, { status: 400 })
  }

  // Convert to CSV
  const json2csvParser = new Parser({ fields })
  const csv = json2csvParser.parse(data)

  logger.info(`Exported ${data.length} ${type} records to CSV`, {
    userId: authResult.user._id,
  })

  // Set headers for file download
  const response = new NextResponse(csv)
  response.headers.set("Content-Type", "text/csv")
  response.headers.set("Content-Disposition", `attachment; filename="${filename}_${Date.now()}.csv"`)

  return response
})
