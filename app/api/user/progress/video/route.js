import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Progress from "@/lib/models/Progress";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // التحقق من وجود request والخصائص المطلوبة
    if (!request) {
      return NextResponse.json(
        { error: "Request object not found" },
        { status: 500 }
      );
    }

    // التحقق من المصادقة
    const payload = await verifyAuth(request);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    const progress = await Progress.findOne({
      user: payload.userId,
      "completedVideos.videoId": videoId,
    });

    return NextResponse.json({
      progress: progress ? progress.currentTime : 0,
      completed: progress ? progress.completed : false,
    });
  } catch (error) {
    console.error("Error in GET /api/user/progress/video:", error);

    if (error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // التحقق من وجود request والخصائص المطلوبة
    if (!request) {
      return NextResponse.json(
        { error: "Request object not found" },
        { status: 500 }
      );
    }

    // التحقق من المصادقة
    const payload = await verifyAuth(request);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { videoId, currentTime, completed, duration } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    // البحث عن التقدم الحالي أو إنشاء جديد
    const existingProgress = await Progress.findOne({
      userId: payload.userId,
      videoId: videoId,
    });

    if (existingProgress) {
      existingProgress.currentTime =
        currentTime || existingProgress.currentTime;
      existingProgress.completed =
        completed !== undefined ? completed : existingProgress.completed;
      existingProgress.duration = duration || existingProgress.duration;
      existingProgress.lastWatched = new Date();
      await existingProgress.save();
    } else {
      await Progress.create({
        userId: payload.userId,
        videoId: videoId,
        currentTime: currentTime || 0,
        completed: completed || false,
        duration: duration || 0,
        lastWatched: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/user/progress/video:", error);

    if (error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
