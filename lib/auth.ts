import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import User from "@/models/User"
import dbConnect from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Generate JWT token
export const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: "30d",
  })
}

// Verify JWT token
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Middleware to protect routes
export const isAuthenticated = async (req: NextRequest) => {
  try {
    // Get token from cookies or authorization header
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value || req.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return {
        success: false,
        message: "Authentication required. Please log in.",
      }
    }

    // Verify token
    const decoded = verifyToken(token) as { id: string } | null

    if (!decoded) {
      return {
        success: false,
        message: "Invalid or expired token. Please log in again.",
      }
    }

    // Connect to database
    await dbConnect()

    // Find user by id
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return {
        success: false,
        message: "User not found. Please log in again.",
      }
    }

    // Return user
    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    return {
      success: false,
      message: "Authentication error. Please try again.",
    }
  }
}

// Middleware to check if user is admin
export const isAdmin = async (req: NextRequest) => {
  const authResult = await isAuthenticated(req)

  if (!authResult.success) {
    return authResult
  }

  if (authResult.user.role !== "admin") {
    return {
      success: false,
      message: "Admin access required.",
    }
  }

  return authResult
}
