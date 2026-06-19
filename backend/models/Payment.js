import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },

    razorpaySignature: {
      type: String,
      default: null,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "created",
        "captured",
        "authorized",
        "failed",
        "refunded",
        "verified",
      ],
      default: "pending",
      index: true,
    },

    plan: {
      type: String,
      enum: ["starter", "pro", "agency"],
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

PaymentSchema.index({ userId: 1, createdAt: -1 });

const Payment =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;

