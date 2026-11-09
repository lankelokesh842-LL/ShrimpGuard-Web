import express from 'express';
import {
  getAlerts,
  markAlertRead,
  markAllAlertsRead,
  deleteAlert
} from '../controllers/alertController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAlerts);
router.patch('/mark-all-read', markAllAlertsRead);
router.patch('/:id/read', markAlertRead);
router.delete('/:id', deleteAlert);

export default router;
