import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    titleNepali: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    messageNepali: {
        type: String
    },
    type: {
        type: String,
        enum: ['booking', 'payment', 'movie_release', 'offer', 'system', 'reminder'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    icon: {
        type: String,
        default: 'notification'
    },
    actionUrl: String,
    actionText: String,
    actionTextNepali: String,
    relatedData: {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
        offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' }
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: Date,
    metadata: {
        imageUrl: String,
        backgroundColor: String,
        textColor: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ type: 1, priority: 1 });

notificationSchema.virtual('timeAgo').get(function () {
    const now = new Date();
    const diffMs = now - this.createdAt;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`
})

export const Notification = mongoose.model('Notification', notificationSchema)