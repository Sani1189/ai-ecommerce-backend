import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { errorHandler } from "@/lib/middleware/errorHandler"

/**
 * @route GET /api/auth/me
 * @desc Get the current authenticated user
 * @access Private
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await isAuthenticated(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    // Return user data without sensitive information
    return NextResponse.json({
      success: true,
      user: {
        _id: authResult.user._id,
        name: authResult.user.name,
        email: authResult.user.email,
        role: authResult.user.role,
        createdAt: authResult.user.createdAt,
        updatedAt: authResult.user.updatedAt,
      },
    })
  } catch (error) {
    return errorHandler(error)
  }
}
