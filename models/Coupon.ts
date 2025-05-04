import mongoose from "mongoose"

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Please provide a coupon code"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Please provide a coupon type"],
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    value: {
      type: Number,
      required: [true, "Please provide a coupon value"],
      min: [0, "Value must be positive"],
    },
    minPurchase: {
      type: Number,
      default: 0,
      min: [0, "Minimum purchase must be positive"],
    },
    maxDiscount: {
      type: Number,
      min: [0, "Maximum discount must be positive"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, "Please provide an expiry date"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      min: [0, "Usage limit must be positive"],
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    applicableCategories: [String],
    excludedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true },
)

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema)

export default Coupon
