import express from 'express';
import {
  addExpense,
  getExpenses,
  deleteExpense
} from '../controllers/expenseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(addExpense)
  .get(getExpenses);

router.delete('/:id', deleteExpense);

export default router;
