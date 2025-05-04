import mongoose from "mongoose"

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price must be positive"],
        },
        image: {
          type: String,
        },
      },
    ],
    shippingInfo: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    paymentInfo: {
      id: {
        type: String,
      },
      status: {
        type: String,
      },
      method: {
        type: String,
        required: true,
        enum: ["stripe", "paypal", "cod"],
        default: "stripe",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal must be positive"],
    },
    tax: {
      type: Number,
      required: true,
      min: [0, "Tax must be positive"],
    },
    shipping: {
      type: Number,
      required: true,
      min: [0, "Shipping must be positive"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount must be positive"],
    },
    total: {
      type: Number,
      required: true,
      min: [0, "Total must be positive"],
    },
    couponApplied: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
    },
    trackingNumber: {
      type: String,
    },
  },
  { timestamps: true },
)

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema)

export default Order
