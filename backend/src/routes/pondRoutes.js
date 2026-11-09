import express from 'express';
import {
  createPond,
  getPonds,
  getPondById,
  updatePond,
  deletePond
} from '../controllers/pondController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createPond)
  .get(getPonds);

router.route('/:id')
  .get(getPondById)
  .put(updatePond)
  .delete(deletePond);

export default router;
