import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "E-commerce API is running",
    version: "1.0.0",
    endpoints: {
      products: "/api/products",
      users: "/api/users",
      auth: "/api/auth",
      orders: "/api/orders",
    },
  })
}
