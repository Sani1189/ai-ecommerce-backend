import mongoose, { Schema, Document } from "mongoose"

export interface BundleProduct {
  product: mongoose.Types.ObjectId
  name: string
  price: number
  category: string
  images: {
    url: string
    alt: string
  }[]
}

export interface IBundle extends Document {
  name: string
  description: string
  mainProduct: BundleProduct
  relatedProducts: BundleProduct[]
  individualTotal: number
  bundlePrice: number
  savings: number
  savingsPercentage: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const BundleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Bundle name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    mainProduct: {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: String,
      price: Number,
      category: String,
      images: [
        {
          url: String,
          alt: String,
        },
      ],
    },
    relatedProducts: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        category: String,
        images: [
          {
            url: String,
            alt: String,
          },
        ],
      },
    ],
    individualTotal: {
      type: Number,
      required: true,
    },
    bundlePrice: {
      type: Number,
      required: true,
    },
    savings: {
      type: Number,
      required: true,
    },
    savingsPercentage: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Bundle || mongoose.model<IBundle>("Bundle", BundleSchema)
