import { type NextRequest, NextResponse } from "next/server"
import { isAdmin, isAuthenticated } from "@/lib/auth"
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
  // Check if user is authenticated
  const authResult = await isAuthenticated(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  // For product images, only admin can upload
  const isProductImage = req.headers.get("x-upload-type") === "product"

  if (isProductImage) {
    const adminResult = await isAdmin(req)
    if (!adminResult.success) {
      return NextResponse.json({ success: false, message: "Admin access required for product images" }, { status: 403 })
    }
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Convert buffer to base64
    const base64String = `data:${file.type};base64,${buffer.toString("base64")}`

    // Upload to Cloudinary
    const folder = isProductImage ? "products" : "user_uploads"

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64String,
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        },
      )
    })

    logger.info(`File uploaded to Cloudinary`, {
      userId: authResult.user._id,
      type: isProductImage ? "product" : "user",
    })

    return NextResponse.json({
      success: true,
      url: (result as any).secure_url,
      public_id: (result as any).public_id,
    })
  } catch (error) {
    logger.error(`Cloudinary upload error`, { error })
    return NextResponse.json({ success: false, message: "File upload failed" }, { status: 500 })
  }
})
