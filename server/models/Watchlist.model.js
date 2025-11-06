import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'notified'],
        default: 'active',
    }
}, { timestamps: true })

watchlistSchema.index({ user: 1, movie: 1 }, { unique: true })

export const Watchlist = mongoose.model('Watchlist', watchlistSchema)