import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import { asyncHandler } from "@/lib/middleware/errorHandler"
import { createLogger } from "@/lib/logger"
import mongoose from "mongoose"
import { HfInference } from "@huggingface/inference"

const logger = createLogger("ChatbotAPI")

// Initialize Hugging Face Inference
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || "")

// ChatQuery schema
const chatQuerySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    query: {
      type: String,
      required: true,
    },
    intent: {
      type: String,
      enum: ["compare", "gift", "budget", "category", "query", "age", "occasion", "specs", "search"],
      required: true,
    },
    matchedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    responseType: {
      type: String,
      enum: ["product_list", "comparison", "text", "error"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

const ChatQuery = mongoose.models.ChatQuery || mongoose.model("ChatQuery", chatQuerySchema)

// Enhanced intent detection using Hugging Face
async function detectIntentWithAI(query: string): Promise<{ intent: string; extractedData: any }> {
  try {
    // Use Hugging Face's text-generation model
    const response = await hf.textGeneration({
      model: "gpt2",
      inputs: `
        Analyze this shopping query and extract the intent and data.
        Query: "${query}"
        
        Possible intents:
        - compare: User wants to compare products
        - gift: User is looking for a gift
        - budget: User has a specific budget
        - category: User is browsing a category
        - age: User is shopping for a specific age group
        - occasion: User is shopping for a specific occasion
        - specs: User is asking about product specifications
        - search: General product search
        
        Format your response as:
        Intent: [intent]
        Data: [extracted data like budget amount, category, age, etc.]
      `,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.2,
      },
    })

    // Parse the response
    const text = response.generated_text
    const intentMatch = text.match(/Intent:\s*(\w+)/i)
    const dataMatch = text.match(/Data:\s*(.*?)(?:\n|$)/i)

    const intent = intentMatch ? intentMatch[1].toLowerCase() : "search"
    const extractedData = dataMatch ? parseExtractedData(dataMatch[1]) : {}

    return { intent, extractedData }
  } catch (error) {
    logger.error("Hugging Face API error", { error })
    // Fallback to basic intent detection
    return {
      intent: detectBasicIntent(query),
      extractedData: {},
    }
  }
}

// Parse extracted data from the AI response
function parseExtractedData(dataText: string): any {
  const data: any = {}

  // Extract budget
  const budgetMatch = dataText.match(/(\$?\d+)/)
  if (budgetMatch) {
    data.budget = Number.parseInt(budgetMatch[1].replace("$", ""))
  }

  // Extract age
  const ageMatch = dataText.match(/(\d+)[\s-]*(year|yr)/i)
  if (ageMatch) {
    data.age = Number.parseInt(ageMatch[1])
  }

  // Extract category
  const categories = ["electronics", "clothing", "furniture", "books", "toys", "beauty", "sports", "food"]
  for (const category of categories) {
    if (dataText.toLowerCase().includes(category)) {
      data.category = category
      break
    }
  }

  // Extract gender
  if (dataText.toLowerCase().match(/\b(male|boy|men|man)\b/)) {
    data.gender = "male"
  } else if (dataText.toLowerCase().match(/\b(female|girl|women|woman)\b/)) {
    data.gender = "female"
  }

  // Extract occasion
  const occasions = ["birthday", "wedding", "anniversary", "christmas", "graduation", "valentine", "holiday"]
  for (const occasion of occasions) {
    if (dataText.toLowerCase().includes(occasion)) {
      data.occasion = occasion
      break
    }
  }

  // Extract product names for comparison
  if (dataText.toLowerCase().includes(" vs ") || dataText.toLowerCase().includes("compare")) {
    const products = dataText
      .split(/\s+vs\s+|\s+and\s+|\s+or\s+|\s+compare\s+/i)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
    if (products.length >= 2) {
      data.products = products
    }
  }

  return data
}

// Basic intent detection as fallback
function detectBasicIntent(query: string): string {
  query = query.toLowerCase()

  if (query.includes("compare") || query.includes("vs") || query.includes("versus")) {
    return "compare"
  } else if (query.includes("gift") || query.includes("present") || query.includes("recommendation")) {
    return "gift"
  } else if (query.includes("under") && (query.includes("$") || query.includes("dollar"))) {
    return "budget"
  } else if (query.includes("category") || query.includes("show me")) {
    return "category"
  } else if (query.includes("year") || query.includes("age") || query.includes("old")) {
    return "age"
  } else if (
    query.includes("birthday") ||
    query.includes("wedding") ||
    query.includes("anniversary") ||
    query.includes("christmas")
  ) {
    return "occasion"
  } else if (query.includes("spec") || query.includes("feature") || query.includes("detail")) {
    return "specs"
  } else {
    return "search"
  }
}

// Extract age from query
function extractAge(query: string, extractedData: any): number | null {
  if (extractedData.age) {
    return Number.parseInt(extractedData.age)
  }

  const ageMatch = query.match(/(\d+)[\s-]*(year|yr)s?[\s-]*(old)/i)
  if (ageMatch && ageMatch[1]) {
    return Number.parseInt(ageMatch[1])
  }

  return null
}

// Extract budget from query
function extractBudget(query: string, extractedData: any): number | null {
  if (extractedData.budget) {
    return Number.parseInt(extractedData.budget)
  }

  const budgetMatch = query.match(/under\s*\$?(\d+)/i)
  if (budgetMatch && budgetMatch[1]) {
    return Number.parseInt(budgetMatch[1])
  }

  return null
}

// Extract category from query
function extractCategory(query: string, extractedData: any): string | null {
  if (extractedData.category) {
    return extractedData.category.toLowerCase()
  }

  const categories = ["electronics", "clothing", "furniture", "books", "toys", "beauty", "sports", "food"]

  query = query.toLowerCase()

  for (const category of categories) {
    if (query.includes(category)) {
      return category
    }
  }

  return null
}

// Extract occasion from query
function extractOccasion(query: string, extractedData: any): string | null {
  if (extractedData.occasion) {
    return extractedData.occasion.toLowerCase()
  }

  const occasions = ["birthday", "wedding", "anniversary", "christmas", "graduation", "valentine", "holiday"]

  query = query.toLowerCase()

  for (const occasion of occasions) {
    if (query.includes(occasion)) {
      return occasion
    }
  }

  return null
}

// Extract gender from query
function extractGender(query: string, extractedData: any): string | null {
  if (extractedData.gender) {
    return extractedData.gender.toLowerCase()
  }

  query = query.toLowerCase()

  if (query.includes("boy") || query.includes("men") || query.includes("man") || query.includes("male")) {
    return "male"
  } else if (query.includes("girl") || query.includes("women") || query.includes("woman") || query.includes("female")) {
    return "female"
  }

  return null
}

// Extract product names for comparison
function extractProductsToCompare(query: string, extractedData: any): string[] {
  if (extractedData.products && Array.isArray(extractedData.products)) {
    return extractedData.products
  }

  query = query.toLowerCase()

  // Look for "X vs Y" pattern
  const vsMatch = query.match(/(.+?)\s+(?:vs|versus)\s+(.+?)(?:\s+|$)/i)
  if (vsMatch) {
    return [vsMatch[1].trim(), vsMatch[2].trim()]
  }

  // Look for "compare X and Y" pattern
  const compareMatch = query.match(/compare\s+(.+?)\s+(?:and|with)\s+(.+?)(?:\s+|$)/i)
  if (compareMatch) {
    return [compareMatch[1].trim(), compareMatch[2].trim()]
  }

  return []
}

export const POST = asyncHandler(async (req: NextRequest) => {
  try {
    // Check if user is authenticated (optional)
    const authResult = await isAuthenticated(req)

    await dbConnect()

    const { query } = await req.json()

    if (!query) {
      return NextResponse.json({ success: false, message: "Query is required" }, { status: 400 })
    }

    // Detect intent using AI
    const { intent, extractedData } = await detectIntentWithAI(query)

    // Log the query for analytics
    const chatQuery = new ChatQuery({
      user: authResult.success ? authResult.user._id : null,
      query,
      intent,
      responseType: "text", // Default, will be updated
    })

    let response

    switch (intent) {
      case "compare":
        const productsToCompare = extractProductsToCompare(query, extractedData)

        if (productsToCompare.length < 2) {
          response = {
            intent,
            message:
              "I'd be happy to compare products for you. Could you specify which products you'd like to compare?",
            type: "text",
          }
          break
        }

        // Find products that match the names
        const comparisonProducts = await Product.find({
          $or: productsToCompare.map((name: string) => ({
            $or: [
              { name: { $regex: name, $options: "i" } },
              { brand: { $regex: name, $options: "i" } },
              { description: { $regex: name, $options: "i" } },
            ],
          })),
          isPublished: true,
        }).limit(4)

        if (comparisonProducts.length < 2) {
          response = {
            intent,
            message: `I couldn't find enough products to compare based on "${productsToCompare.join(" and ")}". Could you try with different product names?`,
            type: "text",
          }
          break
        }

        chatQuery.matchedProducts = comparisonProducts.map((p) => p._id)
        chatQuery.responseType = "comparison"

        // Extract all unique specification keys across all products
        const allSpecKeys = new Set<string>()
        comparisonProducts.forEach((product) => {
          if (product.specifications) {
            for (const key of product.specifications.keys()) {
              allSpecKeys.add(key)
            }
          }
        })

        response = {
          intent,
          message: `Here's a comparison of ${comparisonProducts.map((p) => p.name).join(" and ")}:`,
          products: comparisonProducts,
          specificationKeys: Array.from(allSpecKeys),
          type: "comparison",
        }
        break

      case "budget":
        const budget = extractBudget(query, extractedData)

        if (!budget) {
          response = {
            intent,
            message:
              "I'd be happy to help you find products within your budget. Could you specify your budget, like 'under $100'?",
            type: "text",
          }
          break
        }

        const budgetProducts = await Product.find({
          price: { $lte: budget },
          isPublished: true,
        })
          .sort({ rating: -1 })
          .limit(6)

        if (budgetProducts.length === 0) {
          response = {
            intent,
            message: `I couldn't find any products under $${budget}. Would you like to try a higher budget?`,
            type: "text",
          }
          break
        }

        chatQuery.matchedProducts = budgetProducts.map((p) => p._id)
        chatQuery.responseType = "product_list"

        response = {
          intent,
          message: `Here are some great products under $${budget}:`,
          products: budgetProducts,
          type: "product_list",
        }
        break

      case "category":
        const category = extractCategory(query, extractedData)

        if (!category) {
          response = {
            intent,
            message:
              "I'd be happy to show you products from a specific category. Which category are you interested in? For example: electronics, clothing, furniture, etc.",
            type: "text",
          }
          break
        }

        const categoryProducts = await Product.find({
          category,
          isPublished: true,
        })
          .sort({ rating: -1 })
          .limit(6)

        if (categoryProducts.length === 0) {
          response = {
            intent,
            message: `I couldn't find any products in the ${category} category. Would you like to browse a different category?`,
            type: "text",
          }
          break
        }

        chatQuery.matchedProducts = categoryProducts.map((p) => p._id)
        chatQuery.responseType = "product_list"

        response = {
          intent,
          message: `Here are some top ${category} products:`,
          products: categoryProducts,
          type: "product_list",
        }
        break

      case "age":
        const age = extractAge(query, extractedData)
        const gender = extractGender(query, extractedData)

        if (age === null) {
          response = {
            intent,
            message:
              "I'd be happy to recommend age-appropriate products. Could you specify the age you're shopping for?",
            type: "text",
          }
          break
        }

        // Age-appropriate product logic
        let ageCategory = ""
        const ageFilter: any = { isPublished: true }

        if (age <= 3) {
          ageCategory = "toys"
          ageFilter.tags = { $in: ["toddler", "baby", "infant"] }
        } else if (age <= 12) {
          ageCategory = "toys"
          ageFilter.tags = { $in: ["kids", "children"] }
        } else if (age <= 18) {
          if (gender === "female") {
            ageFilter.category = { $in: ["beauty", "clothing"] }
            ageFilter.tags = { $in: ["teen", "youth"] }
          } else {
            ageFilter.category = { $in: ["electronics", "sports"] }
            ageFilter.tags = { $in: ["teen", "youth"] }
          }
        } else {
          // Adults - use gender or default to electronics
          if (gender === "female") {
            ageFilter.category = { $in: ["beauty", "clothing"] }
          } else if (gender === "male") {
            ageFilter.category = { $in: ["electronics", "sports"] }
          } else {
            ageFilter.category = { $in: ["electronics", "clothing", "beauty"] }
          }
        }

        const ageProducts = await Product.find(ageFilter).sort({ rating: -1 }).limit(6)

        if (ageProducts.length === 0) {
          // Fallback to a broader search if no specific products found
          delete ageFilter.tags

          if (age <= 12) {
            ageFilter.category = "toys"
          }

          const fallbackProducts = await Product.find(ageFilter).sort({ rating: -1 }).limit(6)

          if (fallbackProducts.length === 0) {
            response = {
              intent,
              message: `I couldn't find specific products for a ${age}-year-old. Would you like recommendations for a different age group?`,
              type: "text",
            }
            break
          }

          chatQuery.matchedProducts = fallbackProducts.map((p) => p._id)
          chatQuery.responseType = "product_list"

          const genderText = gender ? ` ${gender}` : ""
          response = {
            intent,
            message: `Here are some products that might be suitable for a ${age}-year-old${genderText}:`,
            products: fallbackProducts,
            type: "product_list",
          }
          break
        }

        chatQuery.matchedProducts = ageProducts.map((p) => p._id)
        chatQuery.responseType = "product_list"

        const genderText = gender ? ` ${gender}` : ""
        response = {
          intent,
          message: `Here are some great products for a ${age}-year-old${genderText}:`,
          products: ageProducts,
          type: "product_list",
        }
        break

      case "occasion":
        const occasion = extractOccasion(query, extractedData)
        const occasionGender = extractGender(query, extractedData)
        const occasionAge = extractAge(query, extractedData)

        if (!occasion) {
          response = {
            intent,
            message:
              "I'd be happy to suggest gifts for a special occasion. Could you specify which occasion you're shopping for?",
            type: "text",
          }
          break
        }

        // Build filter based on occasion, gender, and age
        const filter: any = { isPublished: true }

        // Occasion-specific logic
        switch (occasion) {
          case "birthday":
            if (occasionAge !== null && occasionAge <= 12) {
              filter.category = "toys"
              if (occasionAge <= 3) {
                filter.tags = { $in: ["toddler", "baby"] }
              } else {
                filter.tags = { $in: ["kids", "children"] }
              }
            } else if (occasionGender === "female") {
              filter.category = { $in: ["beauty", "clothing"] }
            } else if (occasionGender === "male") {
              filter.category = { $in: ["electronics", "sports"] }
            } else {
              filter.isFeatured = true
            }
            break
          case "wedding":
          case "anniversary":
            filter.category = { $in: ["furniture", "electronics"] }
            filter.tags = { $in: ["gift", "premium", "luxury"] }
            break
          case "christmas":
          case "holiday":
            filter.isFeatured = true
            filter.tags = { $in: ["gift", "holiday"] }
            break
          case "graduation":
            filter.category = { $in: ["electronics", "books"] }
            filter.tags = { $in: ["gift", "premium"] }
            break
          case "valentine":
            if (occasionGender === "female") {
              filter.category = { $in: ["beauty", "jewelry"] }
            } else if (occasionGender === "male") {
              filter.category = { $in: ["electronics", "clothing"] }
            } else {
              filter.tags = { $in: ["gift", "romantic"] }
            }
            break
          default:
            filter.isFeatured = true
            filter.tags = { $in: ["gift"] }
        }

        const occasionProducts = await Product.find(filter).sort({ rating: -1 }).limit(6)

        if (occasionProducts.length === 0) {
          // Fallback to featured products if no specific matches
          const fallbackProducts = await Product.find({
            isPublished: true,
            isFeatured: true,
          }).limit(6)

          if (fallbackProducts.length === 0) {
            response = {
              intent,
              message: `I couldn't find specific products for ${occasion}. Would you like recommendations for a different occasion?`,
              type: "text",
            }
            break
          }

          chatQuery.matchedProducts = fallbackProducts.map((p) => p._id)
          chatQuery.responseType = "product_list"

          response = {
            intent,
            message: `I couldn't find specific products for ${occasion}, but here are some featured items that might work:`,
            products: fallbackProducts,
            type: "product_list",
          }
          break
        }

        chatQuery.matchedProducts = occasionProducts.map((p) => p._id)
        chatQuery.responseType = "product_list"

        let occasionMessage = `Here are some great gifts for ${occasion}`
        if (occasionAge !== null) {
          occasionMessage += ` for a ${occasionAge}-year-old`
        }
        if (occasionGender) {
          occasionMessage += ` ${occasionGender}`
        }

        response = {
          intent,
          message: `${occasionMessage}:`,
          products: occasionProducts,
          type: "product_list",
        }
        break

      case "gift":
        // For gift recommendations, use a combination of featured and highly-rated products
        const giftGender = extractGender(query, extractedData)
        const giftAge = extractAge(query, extractedData)
        const giftOccasion = extractOccasion(query, extractedData)

        // Build filter based on available information
        const giftFilter: any = {
          isPublished: true,
          rating: { $gte: 4 }, // Only highly rated products for gifts
          tags: { $in: ["gift"] },
        }

        if (giftGender) {
          if (giftGender === "female") {
            giftFilter.category = { $in: ["beauty", "clothing"] }
          } else {
            giftFilter.category = { $in: ["electronics", "sports"] }
          }
        }

        if (giftAge !== null) {
          if (giftAge <= 12) {
            giftFilter.category = "toys"
            if (giftAge <= 3) {
              giftFilter.tags = { $in: ["toddler", "baby", "gift"] }
            } else {
              giftFilter.tags = { $in: ["kids", "children", "gift"] }
            }
          }
        }

        if (giftOccasion) {
          giftFilter.tags = { $in: [giftOccasion, "gift"] }
        }

        const giftProducts = await Product.find(giftFilter).sort({ rating: -1 }).limit(6)

        if (giftProducts.length === 0) {
          // Fallback to featured products
          const fallbackProducts = await Product.find({
            isPublished: true,
            isFeatured: true,
          }).limit(6)

          chatQuery.matchedProducts = fallbackProducts.map((p) => p._id)
          chatQuery.responseType = "product_list"

          response = {
            intent,
            message: `Here are some featured products that would make great gifts:`,
            products: fallbackProducts,
            type: "product_list",
          }
          break
        }

        chatQuery.matchedProducts = giftProducts.map((p) => p._id)
        chatQuery.responseType = "product_list"

        let giftMessage = "Here are some gift ideas"
        if (giftAge !== null) {
          giftMessage += ` for a ${giftAge}-year-old`
        }
        if (giftGender) {
          giftMessage += ` ${giftGender}`
        }
        if (giftOccasion) {
          giftMessage += ` for ${giftOccasion}`
        }

        response = {
          intent,
          message: `${giftMessage}:`,
          products: giftProducts,
          type: "product_list",
        }
        break

      case "specs":
        // Handle product specification questions
        const keywords =
          extractedData.keywords ||
          query
            .split(" ")
            .filter((word: string) => word.length > 3)
            .filter(
              (word: string) =>
                !["what", "tell", "about", "specs", "specifications", "features", "details"].includes(
                  word.toLowerCase(),
                ),
            )

        // Try to find the product being asked about
        const productMatches = await Product.find({
          $text: { $search: keywords.join(" ") },
          isPublished: true,
        })
          .sort({ score: { $meta: "textScore" } })
          .limit(1)

        if (productMatches.length === 0) {
          response = {
            intent,
            message:
              "I couldn't find a specific product matching your query. Could you provide more details about the product you're interested in?",
            type: "text",
          }
          break
        }

        const product = productMatches[0]
        chatQuery.matchedProducts = [product._id]
        chatQuery.responseType = "text"

        // Extract specifications
        const specs = product.specifications ? Object.fromEntries(product.specifications) : {}

        response = {
          intent,
          message: `Here are the specifications for ${product.name}:`,
          product,
          specifications: specs,
          type: "specs",
        }
        break

      case "search":
      default:
        // For general queries, perform a text search
        const searchTerms = query
          .split(" ")
          .filter((word: string) => word.length > 2)
          .filter(
            (word: string) =>
              !["show", "find", "get", "give", "want", "need", "looking", "search"].includes(word.toLowerCase()),
          )
          .join(" ")

        if (!searchTerms) {
          response = {
            intent,
            message:
              "I'd be happy to help you find products. Could you provide more details about what you're looking for?",
            type: "text",
          }
          break
        }

        const searchProducts = await Product.find({
          $text: { $search: searchTerms },
          isPublished: true,
        })
          .sort({ score: { $meta: "textScore" } })
          .limit(6)

        if (searchProducts.length === 0) {
          // Try a more flexible search if text search returns no results
          const flexibleSearchProducts = await Product.find({
            $or: [
              { name: { $regex: searchTerms, $options: "i" } },
              { description: { $regex: searchTerms, $options: "i" } },
              { brand: { $regex: searchTerms, $options: "i" } },
            ],
            isPublished: true,
          }).limit(6)

          if (flexibleSearchProducts.length === 0) {
            response = {
              intent,
              message:
                "I couldn't find specific products matching your query. Try asking about specific categories, products, or features you're interested in.",
              type: "text",
            }
            break
          }

          chatQuery.matchedProducts = flexibleSearchProducts.map((p) => p._id)
          chatQuery.responseType = "product_list"

          response = {
            intent,
            message: `Here are some products related to your search:`,
            products: flexibleSearchProducts,
            type: "product_list",
          }
          break
        }

        chatQuery.matchedProducts = searchProducts.map((p) => p._id)
        chatQuery.responseType = "product_list"

        response = {
          intent,
          message: `Here are some products related to your query:`,
          products: searchProducts,
          type: "product_list",
        }
        break
    }

    // Update response type and save query
    chatQuery.responseType = response.type
    await chatQuery.save()

    logger.info(`Chatbot query processed: "${query}"`, {
      intent,
      userId: authResult.success ? authResult.user._id : null,
    })

    return NextResponse.json({
      success: true,
      response,
    })
  } catch (error) {
    logger.error("Chatbot error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
})
