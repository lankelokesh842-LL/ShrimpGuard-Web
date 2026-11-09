import mongoose from 'mongoose';

const feedRecordSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    morningKg: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    afternoonKg: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    eveningKg: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    totalDailyKg: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    feedType: {
      type: String,
      default: 'Pellet Feed (38% Protein)'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// Pre-save calculate totalDailyKg
feedRecordSchema.pre('save', function (next) {
  this.totalDailyKg = Number((this.morningKg + this.afternoonKg + this.eveningKg).toFixed(2));
  next();
});

export default mongoose.model('FeedRecord', feedRecordSchema);
