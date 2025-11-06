import asyncHandler from "../middleware/asyncHandler.js";
import { History } from "../models/History.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// GET /api/history PRIVATE
export const getMyHistory = asyncHandler(async (req, res) => {
    const history = await History.find({ userId: req.user.id })
        .sort({ watchedAt: -1 })
        .populate({
            path: 'movieId',
            select: 'title posterImage'
        })

    res.status(200).json(new ApiResponse(200, history, "User history fetched successfully."))
})
