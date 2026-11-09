import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
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
    severity: {
      type: String,
      enum: ['warning', 'critical', 'info'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    parameter: {
      type: String
    },
    value: {
      type: Number
    },
    threshold: {
      type: String
    },
    recommendedAction: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    // Future architectural readiness for multi-channel notifications
    channels: {
      inApp: { type: Boolean, default: true },
      emailQueued: { type: Boolean, default: false },
      smsQueued: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

export default mongoose.model('Alert', alertSchema);
