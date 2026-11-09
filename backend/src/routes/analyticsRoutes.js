import express from 'express';
import {
  getFarmerDashboard,
  getPondComparison
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getFarmerDashboard);
router.get('/compare', getPondComparison);

export default router;
