import express from 'express';
import {
  recordManualReading,
  recordSimulatedReading,
  getWaterQualityHistory
} from '../controllers/waterQualityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/manual', recordManualReading);
router.post('/simulate', recordSimulatedReading);
router.get('/history/:pondId', getWaterQualityHistory);

export default router;
