import express from 'express'
import { authorize, protect } from '../middleware/auth.js';
import { createNotification, deleteNotification, getNotifications, markAsRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/read', markAsRead);
router.delete('/:id', deleteNotification);

router.post('/', authorize('admin', createNotification))

export default router;