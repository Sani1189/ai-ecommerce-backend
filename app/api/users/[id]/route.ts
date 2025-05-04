import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import { isAdmin, isAuthenticated } from "@/lib/auth"

// GET a single user (admin or self)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated
    const authResult = await isAuthenticated(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    await dbConnect()

    const { id } = params

    // Only allow admin or self to access user details
    if (authResult.user.role !== "admin" && authResult.user._id.toString() !== id) {
      return NextResponse.json({ success: false, message: "Not authorized to access this user" }, { status: 403 })
    }

    const user = await User.findById(id).select("-password")

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// PUT update a user (admin or self)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated
    const authResult = await isAuthenticated(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    await dbConnect()

    const { id } = params
    const updateData = await req.json()

    // Only allow admin or self to update user
    if (authResult.user.role !== "admin" && authResult.user._id.toString() !== id) {
      return NextResponse.json({ success: false, message: "Not authorized to update this user" }, { status: 403 })
    }

    // Prevent non-admin users from changing their role
    if (authResult.user.role !== "admin" && updateData.role) {
      delete updateData.role
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select("-password")

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// DELETE a user (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    const authResult = await isAdmin(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    await dbConnect()

    const { id } = params

    const user = await User.findByIdAndDelete(id)

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
