// lib/models/Review.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    maxlength: 1000
  },
  helpfulVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isHelpful: {
      type: Boolean,
      required: true
    }
  }],
  instructorResponse: {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      maxlength: 500
    },
    respondedAt: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

reviewSchema.index({ user: 1, course: 1 }, { unique: true });

reviewSchema.virtual('helpfulCount').get(function() {
  return this.helpfulVotes.filter(vote => vote.isHelpful).length;
});

reviewSchema.virtual('notHelpfulCount').get(function() {
  return this.helpfulVotes.filter(vote => !vote.isHelpful).length;
});

reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

reviewSchema.post('save', async function() {
  await updateCourseRating(this.course);
});

reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await updateCourseRating(doc.course);
  }
});

reviewSchema.post('findOneAndUpdate', async function() {
  if (this.getQuery().course) {
    await updateCourseRating(this.getQuery().course);
  }
});

async function updateCourseRating(courseId) {
  const Course = mongoose.model('Course');
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    {
      $match: {
        course: courseId,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$course',
        averageRating: { $avg: '$rating' },
        numberOfReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      numberOfReviews: stats[0].numberOfReviews
    });
  } else {
    await Course.findByIdAndUpdate(courseId, {
      averageRating: 0,
      numberOfReviews: 0
    });
  }
}

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;