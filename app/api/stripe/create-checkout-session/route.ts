import { type NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Product from "@/models/Product"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const authResult = await isAuthenticated(req)

    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 })
    }

    await dbConnect()

    const { items, shippingInfo } = await req.json()

    if (!items || !items.length || !shippingInfo) {
      return NextResponse.json({ success: false, message: "Please provide all required fields" }, { status: 400 })
    }

    // Get product details from database to ensure correct pricing
    const productIds = items.map((item: any) => item.product)
    const products = await Product.find({ _id: { $in: productIds } })

    // Create line items for Stripe
    const lineItems = []

    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.product)

      if (!product) {
        return NextResponse.json({ success: false, message: `Product not found: ${item.product}` }, { status: 400 })
      }

      // Check stock
      if (product.stock < item.quantity) {
        return NextResponse.json({ success: false, message: `Insufficient stock for ${product.name}` }, { status: 400 })
      }

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: product.images.map((img) => img.url),
          },
          unit_amount: Math.round(product.price * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/cart`,
      metadata: {
        userId: authResult.user._id.toString(),
        shippingInfo: JSON.stringify(shippingInfo),
      },
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ success: false, message: "Payment processing error" }, { status: 500 })
  }
}
