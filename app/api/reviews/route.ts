import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Review from "@/models/Review"
import Product from "@/models/Product"
import { isAuthenticated } from "@/lib/auth"

// GET all reviews for a product
export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const url = new URL(req.url)
    const productId = url.searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 })
    }

    // Pagination
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Filtering
    const minRating = url.searchParams.get("minRating")

    // Build filter object
    const filter: any = { product: productId, isApproved: true }

    if (minRating) filter.rating = { $gte: Number.parseInt(minRating) }

    // Sorting
    const sortField = url.searchParams.get("sortField") || "createdAt"
    const sortOrder = url.searchParams.get("sortOrder") || "desc"
    const sort: any = {}
    sort[sortField] = sortOrder === "asc" ? 1 : -1

    // Execute query
    const reviews = await Review.find(filter).populate("user", "name avatar").sort(sort).skip(skip).limit(limit)

    // Get total count for pagination
    const total = await Review.countDocuments(filter)

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get reviews error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// POST create a new review
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const authResult = await isAuthenticated(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    await dbConnect()

    const reviewData = await req.json()

    // Set user ID from authenticated user
    reviewData.user = authResult.user._id

    // Validate required fields
    if (!reviewData.product || !reviewData.rating || !reviewData.text) {
      return NextResponse.json({ success: false, message: "Please provide all required fields" }, { status: 400 })
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: authResult.user._id,
      product: reviewData.product,
    })

    if (existingReview) {
      return NextResponse.json({ success: false, message: "You have already reviewed this product" }, { status: 400 })
    }

    // Create review
    const review = await Review.create(reviewData)

    // Update product rating
    const productId = reviewData.product
    const reviews = await Review.find({ product: productId, isApproved: true })

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0)
      const averageRating = totalRating / reviews.length

      await Product.findByIdAndUpdate(productId, {
        rating: averageRating,
        reviewCount: reviews.length,
      })
    }

    return NextResponse.json(
      {
        success: true,
        review,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create review error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
