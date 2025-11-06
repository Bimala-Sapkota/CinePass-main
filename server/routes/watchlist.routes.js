import express from 'express'
import { protect } from '../middleware/auth.js';
import { addToWatchlist, getMyWatchlist, removeFromWatchlist } from '../controllers/watchlist.controller.js';

const router = express.Router();
router.use(protect);

router.route('/')
    .get(getMyWatchlist)
    .post(addToWatchlist);
router.route('/:movieId')
    .delete(removeFromWatchlist)

export default router;