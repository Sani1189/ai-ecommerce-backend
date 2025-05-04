import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import Bundle from "@/models/Bundle"
import { isAdmin } from "@/lib/auth"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import { cacheWrapper, clearCacheByPattern } from "@/lib/redis"

const logger = createLogger("ProductBundlesAPI")

// GET product bundles
export const GET = asyncHandler(async (req: NextRequest) => {
  await dbConnect()
  logger.info("Fetching product bundles")

  const url = new URL(req.url)
  const productId = url.searchParams.get("productId")
  const category = url.searchParams.get("category")
  const limit = Number.parseInt(url.searchParams.get("limit") || "3")

  // Create a cache key based on the query parameters
  const cacheKey = `products:bundles:${productId || ""}:${category || ""}:${limit}`

  // Use cache wrapper to get data
  const bundles = await cacheWrapper(
    cacheKey,
    async () => {
      // First check if we have any saved bundles
      let savedBundles = []
      
      if (productId) {
        // Find bundles where this product is the main product
        savedBundles = await Bundle.find({
          "mainProduct.product": productId,
          isActive: true,
        }).limit(limit)
        
        if (savedBundles.length > 0) {
          return savedBundles
        }
      } else if (category) {
        // Find bundles for this category
        savedBundles = await Bundle.find({
          "mainProduct.category": category,
          isActive: true,
        }).limit(limit)
        
        if (savedBundles.length > 0) {
          return savedBundles
        }
      } else {
        // Get all active bundles
        savedBundles = await Bundle.find({
          isActive: true,
        }).limit(limit)
        
        if (savedBundles.length > 0) {
          return savedBundles
        }
      }
      
      // If no saved bundles, generate dynamic bundles
      let mainProduct = null
      let relatedProducts = []

      if (productId) {
        // Get the main product
        mainProduct = await Product.findById(productId)

        if (!mainProduct) {
          return []
        }

        // Find complementary products based on category and price range
        const priceRange = {
          min: mainProduct.price * 0.5,
          max: mainProduct.price * 1.5,
        }

        // Find products that complement the main product
        relatedProducts = await Product.find({
          _id: { $ne: productId },
          category: { $ne: mainProduct.category }, // Different category
          price: { $gte: priceRange.min, $lte: priceRange.max },
          isPublished: true,
          stock: { $gt: 0 },
        })
          .sort({ rating: -1 })
          .limit(limit)
      } else if (category) {
        // Get top-rated products in the category
        const topProducts = await Product.find({
          category,
          isPublished: true,
          stock: { $gt: 0 },
        })
          .sort({ rating: -1 })
          .limit(1)

        if (topProducts.length === 0) {
          return []
        }

        mainProduct = topProducts[0]

        // Find complementary products from different categories
        relatedProducts = await Product.find({
          _id: { $ne: mainProduct._id },
          category: { $ne: category },
          isPublished: true,
          stock: { $gt: 0 },
        })
          .sort({ rating: -1 })
          .limit(limit)
      } else {
        // Create bundles based on popular product combinations
        const popularProducts = await Product.find({
          isPublished: true,
          stock: { $gt: 0 },
          isFeatured: true,
        })
          .sort({ rating: -1 })
          .limit(limit + 1)

        if (popularProducts.length === 0) {
          return []
        }

        // Use the first product as the main product
        mainProduct = popularProducts[0]

        // Use the rest as related products
        relatedProducts = popularProducts.slice(1)
      }

      // Calculate bundle price (with a small discount)
      const individualTotal = mainProduct.price + relatedProducts.reduce((sum, product) => sum + product.price, 0)
      const bundleDiscount = 0.1 // 10% discount
      const bundlePrice = Math.round(individualTotal * (1 - bundleDiscount))

      // Create a dynamic bundle
      const dynamicBundle = {
        _id: `bundle-${mainProduct._id}`,
        name: `${mainProduct.name} Bundle`,
        mainProduct: {
          product: mainProduct._id,
          name: mainProduct.name,
          price: mainProduct.price,
          category: mainProduct.category,
          images: mainProduct.images,
        },
        relatedProducts: relatedProducts.map(product => ({
          product: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          images: product.images,
        })),
        individualTotal,
        bundlePrice,
        savings: individualTotal - bundlePrice,
        savingsPercentage: bundleDiscount * 100,
      }

      return [dynamicBundle]
    },
    60 * 30, // Cache for 30 minutes
  )

  logger.info(`Found ${bundles.length} product bundles`)

  return NextResponse.json({
    success: true,
    bundles,
  })
})

// POST create a new product bundle (admin only)
export const POST = asyncHandler(async (req: NextRequest) => {
  // Check if user is admin
  const authResult = await isAdmin(req)

  if (!authResult.success) {
    return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
  }

  await dbConnect()

  const data = await req.json()
  const { name, description, mainProductId, relatedProductIds, discountPercentage } = data

  if (!name || !mainProductId || !relatedProductIds || !Array.isArray(relatedProductIds)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid bundle data. Required fields: name, mainProductId, relatedProductIds",
      },
      { status: 400 },
    )
  }

  // Get the main product
  const mainProduct = await Product.findById(mainProductId)

  if (!mainProduct) {
    return NextResponse.json(
      {
        success: false,
        message: "Main product not found",
      },
      { status: 404 },
    )
  }

  // Get the related products
  const relatedProducts = await Product.find({
    _id: { $in: relatedProductIds },
  })

  if (relatedProducts.length !== relatedProductIds.length) {
    return NextResponse.json(
      {
        success: false,
        message: "One or more related products not found",
      },
      { status: 404 },
    )
  }

  // Calculate bundle price
  const individualTotal = mainProduct.price + relatedProducts.reduce((sum, product) => sum + product.price, 0)
  const bundleDiscount = discountPercentage ? discountPercentage / 100 : 0.1 // Default 10% discount
  const bundlePrice = Math.round(individualTotal * (1 - bundleDiscount))

  // Create the bundle
  const bundle = new Bundle({
    name,
    description,
    mainProduct: {
      product: mainProduct._id,
      name: mainProduct.name,
      price: mainProduct.price,
      category: mainProduct.category,
      images: mainProduct.images,
    },
    relatedProducts: relatedProducts.map(product => ({
      product: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      images: product.images,
    })),
    individualTotal,
    bundlePrice,
    savings: individualTotal - bundlePrice,
    savingsPercentage: bundleDiscount * 100,
    isActive: true,
  })

  await bundle.save()
  
  // Clear bundle cache
  await clearCacheByPattern("products:bundles:*")

  logger.info(`Created new product bundle: ${name}`)

  return NextResponse.json(
    {
      success: true,
      bundle,
    },
    { status: 201 },
  )
})
