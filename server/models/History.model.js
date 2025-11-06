import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
        required: true
    }
    ,
    watchedAt: {
        type: Date,
        default: Date.now
    },
    actionType: {
        type: String,
        enum: ["viewed", "booked"],
        required: true
    }
});

export const History = mongoose.model("History", historySchema)
