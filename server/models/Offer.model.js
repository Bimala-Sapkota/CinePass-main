import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    promoCode: {
      type: String,
      required: [true, "Promo code is required."],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required."],
      min: 0,
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: [true, "Expiration date is required."],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Offer = mongoose.model("Offer", offerSchema);
