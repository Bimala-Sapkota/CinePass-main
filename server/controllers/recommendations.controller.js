import asyncHandler from "../middleware/asyncHandler.js";
import { Booking } from "../models/Booking.model.js";
import { RecommendationEngine } from "../utils/recommendationEngine.util.js";

//GET /api/recommendations PRIVATE
export const getRecommendations = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 6;

    const recommendations = await RecommendationEngine.generateRecommendations(userId, limit);

    res.status(200).json({
        success: true,
        count: recommendations.length,
        data: recommendations
    })
})

//GET /api/recommendations/preferences PRIVATE
export const getUserPreferences = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const userBookings = await Booking.find({ user: userId })
        .populate({
            path: 'showtime',
            populate: {
                path: 'movie',
                select: 'genre language director cast'
            }
        }).sort({ createdAt: -1 })

    const preferences = RecommendationEngine.extractUserPreferences(userBookings);

    res.status(200).json({
        success: true,
        data: {
            preferences,
            totalBookings: userBookings.length
        }
    })
})

