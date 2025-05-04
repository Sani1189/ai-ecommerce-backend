import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Coupon from "@/models/Coupon"

// POST validate a coupon code
export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const { code, cartTotal } = await req.json()

    if (!code) {
      return NextResponse.json({ success: false, message: "Coupon code is required" }, { status: 400 })
    }

    // Find coupon
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    })

    if (!coupon) {
      return NextResponse.json({ success: false, message: "Invalid or expired coupon code" }, { status: 400 })
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, message: "Coupon usage limit reached" }, { status: 400 })
    }

    // Check minimum purchase
    if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum purchase of $${coupon.minPurchase} required`,
        },
        { status: 400 },
      )
    }

    // Calculate discount
    let discountAmount = 0

    if (coupon.type === "percentage") {
      discountAmount = (cartTotal * coupon.value) / 100

      // Apply max discount if specified
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount
      }
    } else {
      // Fixed amount discount
      discountAmount = coupon.value

      // Ensure discount doesn't exceed cart total
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal
      }
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
      },
    })
  } catch (error) {
    console.error("Validate coupon error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
