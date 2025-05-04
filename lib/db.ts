import mongoose from "mongoose"
import { createLogger } from "./logger"

const logger = createLogger("Database")
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    }

    mongoose.connection.on("connected", () => {
      logger.info("MongoDB connected successfully")
    })

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error", { error: err.message })
    })

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected")
    })

    // Handle Node.js process termination and close the MongoDB connection
    process.on("SIGINT", async () => {
      await mongoose.connection.close()
      logger.info("MongoDB connection closed due to app termination")
      process.exit(0)
    })

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      logger.info("Connected to MongoDB")
      return mongoose
    })
  }
  cached.conn = await cached.promise
  return cached.conn
}

export default dbConnect
