import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "instructor", "student"], default: "student" },
    profileImage: { type: String, default: "" },
    lastLogin: { type: Date },
    activeSessions: [
      {
        deviceFingerprint: String,
        ip: String,
        lastActive: Date,
      },
    ],
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    availableCourses: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        availableTopics: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
        allTopicsAvailable: { type: Boolean, default: false },
      },
    ],
    watchHistory: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        video: { type: mongoose.Schema.Types.ObjectId },
        lastPosition: Number,
        lastWatched: Date,
      },
    ],
  },
  { timestamps: true }
);

userSchema.index({ "availableCourses.course": 1 });

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password") && this.password) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

const User = mongoose.models?.User || mongoose.model("User", userSchema);
export default User;
