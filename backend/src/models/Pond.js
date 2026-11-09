import mongoose from 'mongoose';

const pondSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Pond name is required'],
      trim: true
    },
    pondNumber: {
      type: String,
      required: [true, 'Pond number or identifier is required'],
      trim: true
    },
    sizeHectares: {
      type: Number,
      required: [true, 'Pond size in hectares or acres is required'],
      min: 0.1
    },
    stockingDate: {
      type: Date,
      required: [true, 'Stocking date is required']
    },
    shrimpCount: {
      type: Number,
      required: [true, 'Number of shrimp stocked is required'],
      min: 100
    },
    species: {
      type: String,
      required: true,
      default: 'Pacific White Shrimp (Litopenaeus vannamei)'
    },
    initialFeedDetails: {
      feedBrand: { type: String, default: 'CP Aqua / Grobest Starter' },
      pelletSize: { type: String, default: 'Starter Crumble #1' },
      initialQuantityKg: { type: Number, default: 10 }
    },
    status: {
      type: String,
      enum: ['normal', 'warning', 'critical'],
      default: 'normal'
    },
    currentHealthScore: {
      type: Number,
      default: 95,
      min: 0,
      max: 100
    },
    lastReading: {
      temperature: { type: Number },
      pH: { type: Number },
      dissolvedOxygen: { type: Number },
      turbidity: { type: Number },
      timestamp: { type: Date },
      status: { type: String, default: 'normal' }
    }
  },
  { timestamps: true }
);

export default mongoose.model('Pond', pondSchema);
