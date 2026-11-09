import Expense from '../models/Expense.js';

// @desc    Add expense record
// @route   POST /api/expenses
export const addExpense = async (req, res) => {
  try {
    const { pondId, category, amount, date, description } = req.body;

    if (!category || amount === undefined) {
      return res.status(400).json({ success: false, message: 'Category and amount are required' });
    }

    const expense = await Expense.create({
      farmer: req.user._id,
      pond: pondId || null,
      category,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      description
    });

    const populated = await Expense.findById(expense._id).populate('pond', 'name pondNumber');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get expenses for farmer
// @route   GET /api/expenses
export const getExpenses = async (req, res) => {
  try {
    const { pondId, category } = req.query;
    let query = { farmer: req.user._id };

    if (pondId) query.pond = pondId;
    if (category) query.category = category;

    const expenses = await Expense.find(query)
      .populate('pond', 'name pondNumber')
      .sort({ date: -1 });

    const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

    // Group by category
    const byCategory = {};
    expenses.forEach((item) => {
      byCategory[item.category] = (byCategory[item.category] || 0) + item.amount;
    });

    res.json({
      success: true,
      count: expenses.length,
      totalAmount,
      byCategory,
      data: expenses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete expense record
// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }
    if (req.user.role !== 'admin' && expense.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await expense.deleteOne();
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
