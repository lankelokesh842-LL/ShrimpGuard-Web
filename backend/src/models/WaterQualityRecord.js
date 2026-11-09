import mongoose from 'mongoose';

const waterQualityRecordSchema = new mongoose.Schema(
  {
    pond: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pond',
      required: true
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    temperature: {
      type: Number,
      required: [true, 'Temperature is required']
    },
    pH: {
      type: Number,
      required: [true, 'pH value is required']
    },
    dissolvedOxygen: {
      type: Number,
      required: [true, 'Dissolved Oxygen (DO) is required']
    },
    turbidity: {
      type: Number,
      required: [true, 'Turbidity is required']
    },
    isSimulated: {
      type: Boolean,
      default: false
    },
    scenario: {
      type: String,
      enum: ['manual', 'normal', 'warning', 'critical'],
      default: 'manual'
    },
    healthScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['normal', 'warning', 'critical'],
      default: 'normal'
    },
    violations: [
      {
        parameter: String,
        value: Number,
        expected: String,
        severity: {
          type: String,
          enum: ['warning', 'critical']
        },
        message: String
      }
    ],
    recommendedAction: {
      type: String,
      default: 'Water quality is within optimal aquaculture range. Continue routine monitoring.'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('WaterQualityRecord', waterQualityRecordSchema);
