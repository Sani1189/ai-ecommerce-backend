import mongoose, { Schema, Document } from "mongoose"

export interface IFlashSale extends Document {
  name: string
  description?: string
  productIds: mongoose.Types.ObjectId[]
  discountPercentage: number
  startTime: Date
  endTime: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const FlashSaleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Flash sale name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    productIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    discountPercentage: {
      type: Number,
      required: [true, "Discount percentage is required"],
      min: 1,
      max: 99,
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
      default: Date.now,
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

// Index for finding active flash sales
FlashSaleSchema.index({ endTime: 1, isActive: 1 })

export default mongoose.models.FlashSale || mongoose.model<IFlashSale>("FlashSale", FlashSaleSchema)
