import { Notification } from "../models/Notification.model.js"

export const createInAppNotification = async (userId, message, link = '', title = "New Update") => {
    try {
        await Notification.create({
            user: userId,
            title: title,
            message: message,
            type: 'movie_release',
            actionUrl: link,
            priority: 'normal'
        })
    } catch (error) {
        console.error(`Failed to create notification for user ${userId}:`, error);
    }
}