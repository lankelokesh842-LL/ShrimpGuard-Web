import express from 'express';
import {
  getAllFarmers,
  toggleFarmerStatus,
  getAllPondsAdmin,
  getAdminMetrics
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/metrics', getAdminMetrics);
router.get('/farmers', getAllFarmers);
router.patch('/farmers/:id/status', toggleFarmerStatus);
router.get('/ponds', getAllPondsAdmin);

export default router;
