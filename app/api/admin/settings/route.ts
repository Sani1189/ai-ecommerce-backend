import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import { isAdmin } from "@/lib/auth"
import mongoose from "mongoose"

const logger = createLogger("SettingsAPI")

// Settings schema
const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    group: {
      type: String,
      enum: ["general", "appearance", "payment", "shipping", "email", "social", "other"],
      default: "general",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
)

const Settings = mongoose.models.Settings || mongoose.model("Settings", settingsSchema)

// Default settings
const defaultSettings = [
  {
    key: "storeName",
    value: "E-Commerce Store",
    group: "general",
    isPublic: true,
    description: "Name of the store",
  },
  {
    key: "storeDescription",
    value: "Your one-stop shop for all your needs",
    group: "general",
    isPublic: true,
    description: "Short description of the store",
  },
  {
    key: "logoUrl",
    value: "",
    group: "appearance",
    isPublic: true,
    description: "URL to the store logo",
  },
  {
    key: "faviconUrl",
    value: "",
    group: "appearance",
    isPublic: true,
    description: "URL to the store favicon",
  },
  {
    key: "primaryColor",
    value: "#3498db",
    group: "appearance",
    isPublic: true,
    description: "Primary color for the store theme",
  },
  {
    key: "secondaryColor",
    value: "#2ecc71",
    group: "appearance",
    isPublic: true,
    description: "Secondary color for the store theme",
  },
  {
    key: "enableDarkMode",
    value: true,
    group: "appearance",
    isPublic: true,
    description: "Enable dark mode option",
  },
  {
    key: "currencyCode",
    value: "USD",
    group: "general",
    isPublic: true,
    description: "Currency code for the store",
  },
  {
    key: "currencySymbol",
    value: "$",
    group: "general",
    isPublic: true,
    description: "Currency symbol for the store",
  },
  {
    key: "taxRate",
    value: 0.1,
    group: "general",
    isPublic: true,
    description: "Default tax rate",
  },
  {
    key: "shippingFee",
    value: 10,
    group: "shipping",
    isPublic: true,
    description: "Default shipping fee",
  },
  {
    key: "freeShippingThreshold",
    value: 100,
    group: "shipping",
    isPublic: true,
    description: "Order amount for free shipping",
  },
  {
    key: "contactEmail",
    value: "contact@example.com",
    group: "general",
    isPublic: true,
    description: "Contact email for the store",
  },
  {
    key: "contactPhone",
    value: "+1 123 456 7890",
    group: "general",
    isPublic: true,
    description: "Contact phone for the store",
  },
  {
    key: "socialLinks",
    value: {
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
    },
    group: "social",
    isPublic: true,
    description: "Social media links",
  },
  {
    key: "enableReviews",
    value: true,
    group: "general",
    isPublic: true,
    description: "Enable product reviews",
  },
  {
    key: "enableWishlist",
    value: true,
    group: "general",
    isPublic: true,
    description: "Enable wishlist feature",
  },
  {
    key: "enableChatbot",
    value: true,
    group: "general",
    isPublic: true,
    description: "Enable AI chatbot",
  },
  {
    key: "lowStockThreshold",
    value: 10,
    group: "general",
    isPublic: false,
    description: "Threshold for low stock warning",
  },
]

// Initialize settings
async function initializeSettings() {
  try {
    const count = await Settings.countDocuments()

    if (count === 0) {
      await Settings.insertMany(defaultSettings)
      logger.info("Default settings initialized")
    }
  } catch (error) {
    logger.error("Error initializing settings", { error })
  }
}

// GET all settings
export const GET = asyncHandler(async (req: NextRequest) => {
  await dbConnect()

  // Initialize settings if needed
  await initializeSettings()

  const url = new URL(req.url)
  const isPublicOnly = url.searchParams.get("public") === "true"
  const group = url.searchParams.get("group")

  // Check if admin for non-public settings
  let isAdminUser = false
  if (!isPublicOnly) {
    const authResult = await isAdmin(req)
    isAdminUser = authResult.success
  }

  // Build filter
  const filter: any = {}

  if (isPublicOnly && !isAdminUser) {
    filter.isPublic = true
  }

  if (group) {
    filter.group = group
  }

  // Get settings
  const settings = await Settings.find(filter).sort({ group: 1, key: 1 })

  // Convert to key-value object
  const settingsObject = settings.reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    },
    {} as Record<string, any>,
  )

  logger.info(`Retrieved ${settings.length} settings`)

  return NextResponse.json({
    success: true,
    settings: settingsObject,
    metadata: isAdminUser ? settings : undefined,
  })
})

// PUT update settings (admin only)
export const PUT = asyncHandler(async (req: NextRequest) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  // Initialize settings if needed
  await initializeSettings()

  const updates = await req.json()

  if (!updates || typeof updates !== "object") {
    return NextResponse.json({ success: false, message: "Invalid settings data" }, { status: 400 })
  }

  // Update each setting
  const updatePromises = Object.entries(updates).map(async ([key, value]) => {
    return Settings.findOneAndUpdate({ key }, { value }, { new: true })
  })

  const updatedSettings = await Promise.all(updatePromises)

  logger.info(`Updated ${updatedSettings.length} settings`, {
    userId: authResult.user._id,
  })

  return NextResponse.json({
    success: true,
    message: "Settings updated successfully",
  })
})
