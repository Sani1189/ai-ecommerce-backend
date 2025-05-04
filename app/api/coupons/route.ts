import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Coupon from "@/models/Coupon"
import { isAdmin } from "@/lib/auth"

// GET all coupons (admin only)
export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    const authResult = await isAdmin(req)

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
    const isActive = url.searchParams.get("isActive")

    // Build filter object
    const filter: any = {}

    if (isActive) filter.isActive = isActive === "true"

    // Sorting
    const sortField = url.searchParams.get("sortField") || "createdAt"
    const sortOrder = url.searchParams.get("sortOrder") || "desc"
    const sort: any = {}
    sort[sortField] = sortOrder === "asc" ? 1 : -1

    // Execute query
    const coupons = await Coupon.find(filter).sort(sort).skip(skip).limit(limit)

    // Get total count for pagination
    const total = await Coupon.countDocuments(filter)

    return NextResponse.json({
      success: true,
      coupons,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get coupons error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// POST create a new coupon (admin only)
export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const authResult = await isAdmin(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    await dbConnect()

    const couponData = await req.json()

    // Validate required fields
    if (!couponData.code || !couponData.value || !couponData.endDate) {
      return NextResponse.json({ success: false, message: "Please provide all required fields" }, { status: 400 })
    }

    // Create coupon
    const coupon = await Coupon.create(couponData)

    return NextResponse.json(
      {
        success: true,
        coupon,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create coupon error:", error)

    // Handle duplicate code error
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: "Coupon with this code already exists" }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
