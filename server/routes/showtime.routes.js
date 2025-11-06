import express from 'express'
import { createShowtime, deleteShowtime, getAllShowtimes, getShowtimeById, getShowtimeSeatMap } from '../controllers/showtime.controller.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.route("/").get(getAllShowtimes).
post(protect, authorize('admin'), createShowtime);

router.route('/:id').get(getShowtimeById)
.delete(protect, authorize('admin'), deleteShowtime);
router.route('/:id/seats').get(protect, getShowtimeSeatMap);

export default router;