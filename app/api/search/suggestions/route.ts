import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import SearchAnalytics from "@/models/SearchAnalytics"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import { cacheWrapper } from "@/lib/redis"

const logger = createLogger("SearchSuggestionsAPI")

// GET search suggestions
export const GET = asyncHandler(async (req: NextRequest) => {
  await dbConnect()

  const url = new URL(req.url)
  const query = url.searchParams.get("q") || ""
  const limit = Number.parseInt(url.searchParams.get("limit") || "5")

  if (!query || query.length < 2) {
    return NextResponse.json({
      success: true,
      suggestions: [],
    })
  }

  logger.info(`Fetching search suggestions for query: ${query}`)

  // Track search query for analytics
  try {
    const normalizedQuery = query.toLowerCase().trim()
    
    // Update search analytics
    await SearchAnalytics.findOneAndUpdate(
      { term: normalizedQuery },
      { $inc: { count: 1 }, lastSearched: new Date() },
      { upsert: true, new: true }
    )
  } catch (error) {
    logger.error("Error tracking search analytics", { error })
  }

  // Create a cache key based on the query parameters
  const cacheKey = `search:suggestions:${query}:${limit}`

  // Use cache wrapper to get data
  const suggestions = await cacheWrapper(
    cacheKey,
    async () => {
      // Search for products matching the query
      const products = await Product.find({
        $text: { $search: query },
        isPublished: true,
      })
        .select("name category brand")
        .limit(limit)

      // Extract unique categories and brands from the search results
      const categories = [...new Set(products.map((p) => p.category))]
      const brands = [...new Set(products.filter((p) => p.brand).map((p) => p.brand))]

      // Get popular search terms that match the query
      const popularSearchTerms = await SearchAnalytics.find({
        term: { $regex: query, $options: "i" },
      })
        .sort({ count: -1 })
        .limit(3)
        .select("term")

      const searchTerms = popularSearchTerms.map((term) => term.term)

      return {
        products: products.map((p) => ({
          _id: p._id,
          name: p.name,
          category: p.category,
          brand: p.brand,
        })),
        categories: categories.slice(0, 3),
        brands: brands.slice(0, 3),
        searchTerms,
      }
    },
    60 * 5, // Cache for 5 minutes
  )

  logger.info(`Found ${suggestions.products.length} product suggestions`)

  return NextResponse.json({
    success: true,
    query,
    suggestions,
  })
})
