const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    ref: "Product",
    required: [true, "Product ID is required"]
  },
  productName: {
    type: String,
    required: [true, "Product name is required"]
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Minimum quantity is 1"]
  },
  price: {
    type: Number,
    required: [true, "Price is required"]
  }
});

const addressSchema = new mongoose.Schema({
  streetAddress: {
    type: String,
    required: [true, "Street address is required"],
    trim: true
  },
  apartment: String,
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true
  },
  state: {
    type: String,
    required: [true, "State is required"],
    enum: ["Tamil Nadu", "California", "Texas", "New York"]
  },
  zipCode: {
    type: String,
    required: [true, "ZIP code is required"],
    match: [/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"]
  },
  country: {
    type: String,
    required: [true, "Country is required"],
    enum: ["India", "United States (US)", "Canada", "United Kingdom"]
  }
});

const orderSchema = new mongoose.Schema(
  {
    // Customer Information
    customerDetails: {
      firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true
      },
      lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true
      },
      companyName: String,
      email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          "Invalid email"
        ]
      },
      phone: {
        type: String,
        required: [true, "Phone is required"],
        match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/, "Invalid phone number"]
      }
    },

    // Address Information
    shippingAddress: addressSchema,
    billingAddress: addressSchema,

    // Order Items
    itemDetails: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => {
          return items.length > 0;
        },
        message: "At least one order item is required"
      }
    },

    // Financial Information
    shipping: {
      type: Number,
      default: 0.0
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0.01, "Total must be greater than 0"]
    },
    currency: {
      type: String,
      default: "INR",
      enum: ["INR", "USD", "EUR"]
    },

    // Order Metadata
    notes: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"]
    },
    paymentDetails: {
      method: {
        type: String,
        default: "Credit Card",
        enum: ["Credit Card", "Cash on Delivery", "PayPal"]
      },
      status: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Completed", "Failed", "Refunded"]
      }
    },
    orderStatus: {
      type: String,
      default: "Delivered",
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"]
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for optimized queries
orderSchema.index({ user: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "paymentDetails.status": 1 });
orderSchema.index({ "shippingAddress.country": 1 });

// Virtual for formatted order date
orderSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
});

// Pre-save hook for total validation
orderSchema.pre("save", function (next) {
  const calculatedTotal = this.itemDetails.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    this.shipping
  );

  if (Math.abs(calculatedTotal - this.totalAmount) > 0.01) {
    return next(new Error("Total amount mismatch with calculated value"));
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
