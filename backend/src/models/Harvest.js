import mongoose from 'mongoose';

const harvestSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    pond: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pond',
      required: true
    },
    harvestDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    totalWeightKg: {
      type: Number,
      required: [true, 'Total harvested weight in kg is required'],
      min: 0
    },
    countPerKg: {
      type: Number,
      required: [true, 'Shrimp count per kg (size grade) is required'],
      min: 1
    },
    pricePerKg: {
      type: Number,
      required: [true, 'Sale price per kg is required'],
      min: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    survivalRatePercent: {
      type: Number,
      min: 0,
      max: 100
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// Auto calculate revenue
harvestSchema.pre('save', function (next) {
  this.totalRevenue = Number((this.totalWeightKg * this.pricePerKg).toFixed(2));
  next();
});

export default mongoose.model('Harvest', harvestSchema);
