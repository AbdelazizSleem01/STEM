import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    richDescription: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    tags: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    goals: [{ type: String, trim: true }],
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    duration: { type: Number, default: 0 },
    coverImage: { type: String, default: "" },
    topics: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        title: { type: String, required: true },
        description: { type: String, default: "" },
        orderIndex: { type: Number, required: true },
        videos: [
          {
            title: { type: String, required: true },
            description: { type: String, default: "" },
            sourceType: {
              type: String,
              enum: ["youtube", "hosted"],
              required: true,
            },
            sourceUrl: { type: String, required: true },
            duration: { type: Number, default: 0 },
            thumbnails: {
              default: { type: String, default: "" },
              medium: { type: String, default: "" },
              high: { type: String, default: "" },
            },
            orderIndex: { type: Number, default: 0 },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

courseSchema.index({ title: "text", description: "text", tags: "text" });
courseSchema.index({ instructor: 1 });
courseSchema.index({ "topics.id": 1 });

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);
export default Course;
