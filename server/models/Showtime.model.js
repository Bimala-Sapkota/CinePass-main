import mongoose, { mongo } from 'mongoose';

const showtimeSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    theater: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater',
        required: true
    },
    screen: {
        type: String,
        required: [true, 'Please specify screen']
    },
    startTime: {
        type: Date,
        required: [true, 'Please add start time']
    },
    endTime: {
        type: Date,
        required: [true, 'Please add end time']
    },
    ticketPrice: {
        standard: Number,
        premium: Number
    },
    seatAvailability: [{
        _id: false,
        seatName: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['available', 'locked', 'booked'],
            default: 'available'
        },
        type: {
            type: String,
            enum: ['standard', 'premium'],
            default: 'standard'
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        lockedUntil: {
            type: Date,
            default: null
        }
    }],
    hasLockedSeats: {
        type: Boolean,
        default: false,
        index: true
    }
    ,
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Prevent overlapping showtimes on the same screen
showtimeSchema.index(
    {
        theater: 1,
        screen: 1,
        startTime: 1,
        endTime: 1
    },
    { unique: true }
);

// Add proper indexing
showtimeSchema.index({ movie: 1, startTime: 1 });
showtimeSchema.index({ theater: 1, startTime: 1 });

export const Showtime = mongoose.model('Showtime', showtimeSchema);
