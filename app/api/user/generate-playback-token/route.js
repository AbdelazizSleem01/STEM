import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { generatePlaybackToken } from "@/lib/video-security";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Course from "@/lib/models/Course";

export async function POST(request) {
  // تحقق من وجود request
  if (!request) {
    return NextResponse.json(
      { error: "Request object is missing" },
      { status: 400 }
    );
  }
  
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, videoId } = await request.json();

    if (!courseId || !videoId) {
      return NextResponse.json(
        { error: "Course ID and Video ID are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(auth.userId).populate({
      path: "availableCourses.course",
      select: "_id title",
      match: { _id: { $ne: null } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const validCourses = user.availableCourses.filter(
      (ac) => ac.course && ac.course._id
    );

    const userCourse = validCourses.find(
      (ac) => ac.course._id.toString() === courseId
    );

    if (!userCourse) {
      return NextResponse.json(
        { error: "You do not have access to this course" },
        { status: 403 }
      );
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    let videoFound = false;
    let topicId = null;

    for (const topic of course.topics) {
      const video = topic.videos.find(
        (v) => v._id?.toString() === videoId || v.id === videoId
      );
      if (video) {
        videoFound = true;
        topicId = topic.id || topic._id.toString();
        break;
      }
    }

    if (!videoFound) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (
      !userCourse.allTopicsAvailable &&
      !userCourse.availableTopics.includes(topicId)
    ) {
      return NextResponse.json(
        { error: "You do not have access to this topic" },
        { status: 403 }
      );
    }

    const token = generatePlaybackToken(auth.userId, courseId, videoId);

    return NextResponse.json({
      token,
      expiresIn: 5 * 60, 
      message: "Playback token generated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}