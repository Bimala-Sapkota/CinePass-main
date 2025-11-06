import express from 'express'
import { protect } from '../middleware/auth.js';
import { getMyHistory } from '../controllers/history.controller.js';

const router = express.Router();
router.use(protect);

router.route('/').get(getMyHistory);

export default router;