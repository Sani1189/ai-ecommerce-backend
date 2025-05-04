import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import { isAdmin } from "@/lib/auth"
import { ApiError } from "@/lib/middleware/errorHandler"
import mongoose from "mongoose"

const logger = createLogger("ContactAPI")

// Get Contact model
const Contact = mongoose.models.Contact

// GET a single contact submission (admin only)
export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  const { id } = params

  const contact = await Contact.findById(id)

  if (!contact) {
    throw new ApiError("Contact submission not found", 404)
  }

  logger.info(`Contact submission retrieved: ${id}`)

  return NextResponse.json({
    success: true,
    contact,
  })
})

// PUT mark contact as read (admin only)
export const PUT = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  const { id } = params
  const { isRead } = await req.json()

  const contact = await Contact.findByIdAndUpdate(id, { isRead }, { new: true })

  if (!contact) {
    throw new ApiError("Contact submission not found", 404)
  }

  logger.info(`Contact submission marked as ${isRead ? "read" : "unread"}: ${id}`)

  return NextResponse.json({
    success: true,
    contact,
  })
})

// DELETE a contact submission (admin only)
export const DELETE = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  const { id } = params

  const contact = await Contact.findByIdAndDelete(id)

  if (!contact) {
    throw new ApiError("Contact submission not found", 404)
  }

  logger.info(`Contact submission deleted: ${id}`)

  return NextResponse.json({
    success: true,
    message: "Contact submission deleted successfully",
  })
})
