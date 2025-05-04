import { type NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import { v2 as cloudinary } from "cloudinary"

const logger = createLogger("CloudinaryAPI")

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const POST = asyncHandler(async (req: NextRequest) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  const { public_id } = await req.json()

  if (!public_id) {
    return NextResponse.json({ success: false, message: "Public ID is required" }, { status: 400 })
  }

  try {
    // Delete from Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(public_id, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })

    logger.info(`File deleted from Cloudinary`, {
      userId: authResult.user._id,
      public_id,
    })

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    logger.error(`Cloudinary delete error`, { error })
    return NextResponse.json({ success: false, message: "File deletion failed" }, { status: 500 })
  }
})
