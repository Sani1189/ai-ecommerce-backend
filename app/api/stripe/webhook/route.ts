import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import dbConnect from "@/lib/db"
import Order from "@/models/Order"
import Product from "@/models/Product"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = headers()
    const signature = headersList.get("stripe-signature") || ""

    let event

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ success: false, message: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      // Fulfill the order
      await fulfillOrder(session)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe webhook error:", error)
    return NextResponse.json({ success: false, message: "Webhook processing error" }, { status: 500 })
  }
}

async function fulfillOrder(session: Stripe.Checkout.Session) {
  try {
    await dbConnect()

    // Get session details
    const userId = session.metadata?.userId
    const shippingInfo = JSON.parse(session.metadata?.shippingInfo || "{}")

    // Get line items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

    // Get expanded product details
    const expandedLineItems = await Promise.all(
      lineItems.data.map(async (item) => {
        const product = await stripe.products.retrieve(item.price?.product as string)
        return {
          ...item,
          product_details: product,
        }
      }),
    )

    // Create order items
    const orderItems = expandedLineItems.map((item) => {
      return {
        name: item.description || item.product_details.name,
        quantity: item.quantity,
        price: (item.price?.unit_amount || 0) / 100, // Convert from cents to dollars
        image: item.product_details.images?.[0] || "",
        // Note: We don't have the product ID from MongoDB here
        // In a real app, you'd need to map Stripe products to your DB products
      }
    })

    // Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingInfo,
      paymentInfo: {
        id: session.id,
        status: session.payment_status,
        method: "stripe",
      },
      subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
      tax: 0, // You'd calculate this based on your business logic
      shipping: 0, // You'd calculate this based on your business logic
      total: session.amount_total ? session.amount_total / 100 : 0,
      status: "processing",
    })

    // Update product stock (in a real app, you'd need to map products correctly)
    // This is a simplified example
    for (const item of orderItems) {
      // Find product by name (not ideal, but works for this example)
      const product = await Product.findOne({ name: item.name })

      if (product) {
        product.stock -= item.quantity
        await product.save()
      }
    }

    console.log(`Order fulfilled: ${order._id}`)
  } catch (error) {
    console.error("Error fulfilling order:", error)
    throw error
  }
}
