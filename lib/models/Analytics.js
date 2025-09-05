import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  uniqueVisitors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  videoEngagement: [{
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    },
    views: Number,
    completions: Number,
    averageWatchTime: Number,
    dropOffPoints: [{
      timestamp: Number,
      count: Number
    }]
  }],
  totalTimeWatched: {
    type: Number,
    default: 0 // in seconds
  },
  completionRate: {
    type: Number,
    default: 0 // percentage
  },
  deviceTypes: [{
    type: String,
    count: Number
  }],
  geographicData: [{
    country: String,
    count: Number
  }]
}, {
  timestamps: true
});

// Index for efficient queries
analyticsSchema.index({ course: 1, date: 1 });

const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);

export default Analytics;
