import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/lib/models/Course";

export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = params;
    await connectDB();
    const course = await Course.findById(courseId).lean();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}