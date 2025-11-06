import asyncHandler from "../middleware/asyncHandler.js";
import { Notification } from "../models/Notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//GET /api/notifications PRIVATE
export const getNotifications = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;
    const unreadOnly = req.query.unread === 'true';

    const query = {
        user: req.user.id,
        isActive: true,
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } }
        ]
    }

    if (type) query.type = type;
    if (unreadOnly) query.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
        Notification.find(query)
            .populate('relatedData.movieId', 'title titleNepali posterImage')
            .populate('relatedData.bookingId', 'bookingReference seats')
            .sort({ priority: -1, createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .lean(),
        Notification.countDocuments({
            user: req.user.id,
            isRead: false,
            isActive: true
        })
    ])

    const localizedNotifications = notifications.map(notification => ({
        ...notification,
        title: req.language === 'ne' && notification.titleNepali ?
            notification.titleNepali : notification.title,
        message: req.language === 'ne' && notification.messageNepali ?
            notification.messageNepali : notification.message,
        actionText: req.language === 'ne' && notification.actionTextNepali ?
            notification.actionTextNepali : notification.actionText
    }));

    return res.status(200).json(
        new ApiResponse(200, {
            notifications: localizedNotifications,
            unreadCount,
            hasMore: notifications.length === limit
        }, "Notifications retrieved successfully")
    )
})

//PATCH /api/notifications/read PRIVATE
export const markAsRead = asyncHandler(async (req, res) => {
    const { notificationIds, markAll } = req.body;
    let updateQuery = { user: req.user.id }

    if (markAll) {
        updateQuery.isRead = false;

    } else if (notificationIds && Array.isArray(notificationIds)) {
        updateQuery._id = { $in: notificationIds }
    } else {
        throw new ApiError(400, "Either provide notificationIds array or set markAll to true")
    }

    const result = await Notification.updateMany(
        updateQuery,
        { isRead: true, readAt: new Date() }
    )

    return res.status(200).json(new ApiResponse(
        200,
        { modifiedCount: result.modifiedCount },
        "Notifications marked as read"
    ))
})

//POST /api/notifications PRIVATE[admin]
export const createNotification = asyncHandler(async (req, res) => {
    const { userIds,
        title,
        titleNepali,
        message,
        messageNepali,
        type,
        priority = 'normal',
        icon,
        actionUrl,
        actionText,
        actionTextNepali,
        relatedData = {},
        expiresAt,
        metadata = {}
    } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new ApiError(400, "userIds array is required")
    }

    const notifications = userIds.map(userId => ({
        user: userId,
        title,
        titleNepali,
        message,
        messageNepali,
        type,
        priority,
        icon,
        actionUrl,
        actionText,
        actionTextNepali,
        relatedData,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        metadata
    }))

    const created = await Notification.insertMany(notifications)

    return res.status(201).json(new ApiResponse(201, { created: created.length }, "Notifications created successfully"))
})

//DELETE /api/notifications/:id PRIVATE
export const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndDelete({
        _is: req.params.id,
        user: req.user.id
    })

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Notification deleted successfully")
    );
})

// Helper function to create notifications
export const createNotificationForUser = async (userId, notificationData) => {
    try {
        const notification = new Notification({
            user: userId,
            ...notificationData
        })

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

// Helper function for bulk notifications
export const createBulkNotifications = async (userIds, notificationData) => {
    try {
        const notifications = userIds.map(userId => ({
            user: userId,
            ...notificationData
        }));

        return await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error creating bulk notifications:', error);
    }
};