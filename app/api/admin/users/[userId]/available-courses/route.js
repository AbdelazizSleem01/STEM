import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Course from "@/lib/models/Course";
import { verifyAuth } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    if (!params || !params.userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    const { userId } = params;

    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findById(userId).populate({
      path: "availableCourses.course",
      select: "title description topics",
      populate: {
        path: "topics",
        select: "title videos"
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formattedCourses = user.availableCourses
      .filter(ac => ac.course !== null)
      .map((ac) => ({
        course: {
          id: ac.course._id.toString(),
          title: ac.course.title,
          description: ac.course.description,
          topics: ac.course.topics || []
        },
        availableTopics: ac.availableTopics || [],
        allTopicsAvailable: ac.allTopicsAvailable || false
      }));

    return NextResponse.json({ availableCourses: formattedCourses });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function POST(request, { params }) {
  try {
    if (!params || !params.userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    const { userId } = params;

    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, availableTopics = [], allTopicsAvailable = false } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const exists = user.availableCourses.some(
      (ac) => ac.course.toString() === courseId
    );
    if (exists) {
      return NextResponse.json(
        { error: "Course already assigned" },
        { status: 400 }
      );
    }

    user.availableCourses.push({
      course: courseId,
      availableTopics,
      allTopicsAvailable,
    });

    await user.save();

    await user.populate({
      path: "availableCourses.course",
      select: "_id title description"
    });

    const formattedCourses = user.availableCourses
      .filter(ac => ac.course !== null)
      .map((ac) => ({
        ...ac.toObject(),
        course: {
          ...ac.course.toObject(),
          id: ac.course._id.toString(),
          _id: undefined,
        },
        availableTopics: ac.availableTopics || [],
        allTopicsAvailable: ac.allTopicsAvailable || false,
      }));

    return NextResponse.json({
      message: "Course assigned successfully",
      availableCourses: formattedCourses,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!params || !params.userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    const { userId } = params;

    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.availableCourses = user.availableCourses.filter(
      (ac) => ac.course.toString() !== courseId
    );

    await user.save();

    return NextResponse.json({ message: "Course removed successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}