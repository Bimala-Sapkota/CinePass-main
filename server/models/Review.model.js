import mongoose, { mongo } from "mongoose";

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please provide a rating between 1 and 5'],
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot be more than 500 characters'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true,
    },
}, { timestamps: true })
//only allow user to give one review per movie
reviewSchema.index({ movie: 1, user: 1 }, { unique: true });

reviewSchema.statics.calculateAverageRating = async function (movieId) {
    const stats = await this.aggregate([
        {
            $match: { movie: movieId }
        },
        {
            $group: {
                _id: '$movie',
                numRatings: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])

    try {
        if (stats.length > 0) {
            await this.model('Movie').findByIdAndUpdate(movieId, {
                userScore: {
                    average: stats[0].avgRating,
                    count: stats[0].numRatings
                }
            })
        } else {
            await this.model('Movie').findByIdAndUpdate(movieId, {
                userScore: {
                    average: 0,
                    count: 0
                }
            })
        }
    } catch (error) {
        console.error(err)
    }
}

reviewSchema.post('save', function () {
    this.constructor.calculateAverageRating(this.movie);
})
reviewSchema.post('remove', function () {
    this.constructor.calculateAverageRating(this.movie)
})

export const Review = mongoose.model('Review', reviewSchema)