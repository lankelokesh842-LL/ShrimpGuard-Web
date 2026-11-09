import express from 'express';
import {
  logFeed,
  getFeedRecords,
  getFeedAnalytics,
  deleteFeedRecord
} from '../controllers/feedController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(logFeed)
  .get(getFeedRecords);

router.get('/analytics', getFeedAnalytics);
router.delete('/:id', deleteFeedRecord);

export default router;
