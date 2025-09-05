import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  timeLimit: Number,
  passingScore: {
    type: Number,
    default: 70
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer'],
      required: true
    },
    options: [String], // For multiple choice
    correctAnswer: {
      type: mongoose.Schema.Mixed,
      required: true
    },
    points: {
      type: Number,
      default: 1
    }
  }],
  orderIndex: Number,
  isRequired: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);

export default Quiz;
