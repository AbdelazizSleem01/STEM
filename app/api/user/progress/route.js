import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Progress from "@/lib/models/Progress";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const progress = await Progress.find({ user: auth.userId }).populate({
      path: "course",
      select: "title topics",
    });

    const progressData = progress.reduce((acc, p) => {
      acc[p.course.id] = {
        courseId: p.course.id,
        completedVideos: p.completedVideos || [],
        completedQuizzes: p.completedQuizzes || [],
      };
      return acc;
    }, {});

    return NextResponse.json({ progress: progressData });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
