import mongoose, { Schema, Document } from "mongoose"

export interface ISearchAnalytics extends Document {
  term: string
  count: number
  lastSearched: Date
  createdAt: Date
  updatedAt: Date
}

const SearchAnalyticsSchema: Schema = new Schema(
  {
    term: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    lastSearched: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Create a text index for searching
SearchAnalyticsSchema.index({ term: "text" })

export default mongoose.models.SearchAnalytics || mongoose.model<ISearchAnalytics>("SearchAnalytics", SearchAnalyticsSchema)
