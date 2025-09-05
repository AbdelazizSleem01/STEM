import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  completedVideos: [
    {
      videoId: { type: String, required: true },
      watchedDuration: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
    },
  ],
  completedQuizzes: [
    {
      quizId: { type: String, required: true },
      completed: { type: Boolean, default: false },
      score: { type: Number, default: 0 },
    },
  ],
}, { timestamps: true });

progressSchema.index({ user: 1, course: 1 });

const Progress = mongoose.models.Progress || mongoose.model("Progress", progressSchema);
export default Progress;