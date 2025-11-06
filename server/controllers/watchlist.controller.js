import asyncHandler from "../middleware/asyncHandler.js";
import { Watchlist } from "../models/Watchlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//  GET /api/watchlist PRIVATE
export const getMyWatchlist = asyncHandler(async (req, res) => {
    const watchlist = await Watchlist.find({ user: req.user.id }).populate('movie');
    res.status(200).json(new ApiResponse(200, watchlist, "Watchlist fetched."))
})

//  POST //api/watchlist PRIVATE
export const addToWatchlist = asyncHandler(async (req, res) => {
    const { movieId } = req.body;
    const userId = req.user.id;

    if (!movieId) {
        throw new ApiError(400, "Movie ID is required.");
    }

    const existing = await Watchlist.findOne({ user: userId, movie: movieId })
    if (existing) {
        return res.status(200).json(new ApiResponse(200, existing, "Movie is already on your watchlist."))

    }

    const watchlistItem = await Watchlist.create({ user: userId, movie: movieId })
    res.status(201).json(new ApiResponse(201, watchlistItem, "Added to watchlist successfully."))
})

// DELETE /api/watchlist/:movieId PRIVATE
export const removeFromWatchlist = asyncHandler(async (req, res) => {
    const { movieId } = req.params;
    const userId = req.user.id;

    const result = await Watchlist.deleteOne({ user: userId, movie: movieId })

    if (result.deletedCount === 0) {
        throw new ApiError(404, "Movie not found in your watchlist.")
    }

    res.status(200).json(new ApiResponse(200, {}, "Removed from watchlist successfully."))
})
