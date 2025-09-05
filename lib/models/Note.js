import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
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
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    default: null
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// إنشاء indexes للبحث السريع
noteSchema.index({ user: 1, course: 1 });
noteSchema.index({ user: 1, video: 1 });
noteSchema.index({ createdAt: -1 });

const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);
export default Note;