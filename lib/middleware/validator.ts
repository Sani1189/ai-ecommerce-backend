export const validate = <T>(schema: z.ZodType<T>) => {
  return async (req: NextRequest): Promise<{ data: T } | NextResponse> => {
    try {
      const body = await req.json()
      const data = schema.parse(body)
      return { data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
        
        return NextResponse.json(
          { success: false, message: "Validation failed", errors },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { success: false, message: "Invalid request data" },
        { status: 400 }
      )
    }
  }
}
