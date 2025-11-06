import express from 'express'
import { protect } from '../middleware/auth.js';
import { getRecommendations, getUserPreferences } from '../controllers/recommendations.controller.js';

const router = express.Router();

router.use(protect);

router.get("/", getRecommendations);
router.get('/preferences', getUserPreferences);

export default router;