import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course from "@/lib/models/Course";
import User from "@/lib/models/User";
import { verifyAuth } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.role || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params; // Course ID
    const { userId } = await request.json(); // User ID to enroll

    await connectDB();

    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add course to user's enrolledCourses if not already enrolled
    if (!user.enrolledCourses.includes(id)) {
      user.enrolledCourses.push(id);
      await user.save();
    }

    return NextResponse.json({ message: "User enrolled successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}