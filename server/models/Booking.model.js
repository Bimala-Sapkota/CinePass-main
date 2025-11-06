import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime",
      required: true,
    },
    seats: {
      type: [String],
      required: [true, "Please select at least one seat"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Please add total price"],
    },
    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Completed",
        "Failed",
        "Refunded",
        "Cancelled",
        "Refund-Pending-Manual",
      ],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["esewa", "khalti", "card", "cash"],
      required: [true, "Please add payment method"],
    },
    paymentId: {
      type: String,
    },
    bookingReference: {
      type: String,
      unique: true,
    },
    qrCode: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Used"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Generate booking reference and QR code before saving
bookingSchema.pre("save", function (next) {
  if (!this.bookingReference) {
    // Generate unique reference code: CP-timestamp-random
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.bookingReference = `CP-${timestamp}${random}`;

    // Generate QR code URL (using a public service for demo)
    const qrData = `${this.bookingReference}-${this._id}`;
    this.qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      qrData
    )}`;
  }
  next();
});

// Add compound index for querying
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ showtime: 1 });
bookingSchema.index({ paymentStatus: 1, createdAt: -1 });

// bookingSchema.index({ bookingReference: 1 });

export const Booking = mongoose.model("Booking", bookingSchema);
