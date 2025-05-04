import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import { isAdmin } from "@/lib/auth"

// GET all users (admin only)
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
    const searchParam = url.searchParams.get("search")
    const role = url.searchParams.get("role")

    // Build filter object
    const filter: any = {}

    if (searchParam) {
      filter.$or = [{ name: { $regex: searchParam, $options: "i" } }, { email: { $regex: searchParam, $options: "i" } }]
    }

    if (role) filter.role = role

    // Sorting
    const sortField = url.searchParams.get("sortField") || "createdAt"
    const sortOrder = url.searchParams.get("sortOrder") || "desc"
    const sort: any = {}
    sort[sortField] = sortOrder === "asc" ? 1 : -1

    // Execute query
    const users = await User.find(filter).select("-password").sort(sort).skip(skip).limit(limit)

    // Get total count for pagination
    const total = await User.countDocuments(filter)

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
