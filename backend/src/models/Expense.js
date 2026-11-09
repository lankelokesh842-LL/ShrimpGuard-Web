import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pond: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pond'
    },
    category: {
      type: String,
      enum: [
        'Feed',
        'Seed/Postlarvae',
        'Electricity/Fuel',
        'Labor',
        'Chemicals/Probiotics',
        'Maintenance',
        'Testing & Lab',
        'Other'
      ],
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: 0
    },
    date: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Expense', expenseSchema);
