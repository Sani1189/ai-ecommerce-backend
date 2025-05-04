import { type NextRequest, NextResponse } from "next/server"

export class ApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (error: unknown) => {
  console.error("API Error:", error)

  if (error instanceof ApiError) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode })
  }

  // Mongoose duplicate key error
  if ((error as any).code === 11000) {
    const field = Object.keys((error as any).keyValue)[0]
    return NextResponse.json(
      { success: false, message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` },
      { status: 400 },
    )
  }

  // Mongoose validation error
  if ((error as any).name === "ValidationError") {
    const messages = Object.values((error as any).errors).map((val: any) => val.message)
    return NextResponse.json({ success: false, message: messages.join(", ") }, { status: 400 })
  }

  return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
}

export const asyncHandler = (handler: (req: NextRequest, params?: any) => Promise<NextResponse>) => {
  return async (req: NextRequest, params?: any) => {
    try {
      return await handler(req, params)
    } catch (error) {
      return errorHandler(error)
    }
  }
}
