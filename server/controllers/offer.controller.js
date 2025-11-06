import asyncHandler from "../middleware/asyncHandler.js";
import { Offer } from "../models/Offer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// GET /api/offers/active PUBLIC
export const getActiveOffers = asyncHandler(async (req, res) => {
  const now = new Date();
  const offers = await Offer.find({
    isActive: true,
    validUntil: { $gte: now },
  }).sort({ createdAt: -1 });
  res
    .status(200)
    .json(new ApiResponse(200, offers, "Active offers fetched successfully."));
});

// GET /api/offers PRIVATE[Admin]
export const getAllOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find().sort({ createdAt: -1 });
  res
    .status(200)
    .json(new ApiResponse(200, offers, "Offers fetched successfully."));
});

// POST /api/offers PRIVATE[Admin]
export const createOffer = asyncHandler(async (req, res) => {
  const {
    promoCode,
    description,
    discountType,
    discountValue,
    validUntil,
    minPurchaseAmount,
    isActive,
  } = req.body;

  const offerExists = await Offer.findOne({ promoCode });
  if (offerExists) {
    throw new ApiError(409, "An offer with this promo code already exists.");
  }

  const offer = await Offer.create({
    promoCode,
    description,
    discountType,
    discountValue,
    validUntil,
    minPurchaseAmount,
    isActive,
  });
  res
    .status(201)
    .json(new ApiResponse(201, offer, "Offer created successfully."));
});

// PATCH /api/offers/:id PRIVATE[Admin]
export const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!offer) throw new ApiError(404, "Offer not found.");
  res
    .status(200)
    .json(new ApiResponse(200, offer, "Offer updated successfully."));
});

// DELETE /api/offers/:id PRIVATE[Admin]
export const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) throw new ApiError(404, "Offer not found.");
  await offer.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, "Offer deleted successfully."));
});

// POST /api/offers/validate PRIVATE
export const validatePromoCode = asyncHandler(async (req, res) => {
  const { promoCode, purchaseAmount } = req.body;

  const offer = await Offer.findOne({ promoCode: promoCode.toUpperCase() });

  if (!offer) throw new ApiError(404, "Invalid promo code.");
  if (!offer.isActive)
    throw new ApiError(400, "This promo code is currently inactive.");

  const now = new Date();
  if (now < offer.validFrom || now > offer.validUntil) {
    throw new ApiError(400, "This promo code has expired.");
  }
  if (purchaseAmount < offer.minPurchaseAmount) {
    throw new ApiError(
      400,
      `A minimum purchase of NRs. ${offer.minPurchaseAmount} is required.`
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, offer, "Promo code applied successfully!"));
});
