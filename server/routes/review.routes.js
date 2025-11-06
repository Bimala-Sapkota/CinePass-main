import express from 'express'
import { createReview, deleteReview, getReviewsForMovie, updateReview } from '../controllers/review.controller.js'
import { protect } from './../middleware/auth.js';
const router = express.Router({ mergeParams: true })

router.route('/')
    .get(getReviewsForMovie)
    .post(protect, createReview)

router.route('/:reviewId')
    .put(protect, updateReview)
    .delete(protect, deleteReview)

export default router;