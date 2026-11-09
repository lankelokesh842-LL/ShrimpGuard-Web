import express from 'express';
import {
  recordHarvest,
  getHarvests,
  deleteHarvest
} from '../controllers/harvestController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(recordHarvest)
  .get(getHarvests);

router.delete('/:id', deleteHarvest);

export default router;
