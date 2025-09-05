import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Course from "@/lib/models/Course";

export async function PUT(request, context) {
  try {
    let auth;
    try {
      auth = await verifyAuth(request);
    } catch (authError) {
      return NextResponse.json(
        { error: `Authentication failed: ${authError.message}` },
        { status: 401 }
      );
    }

    if (!auth.role || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { params } = await context;
    const { id } = await params;
    const {
      title,
      description,
      richDescription,
      category,
      price,
      coverImage,
      level,
      duration,
      tags = [],
      requirements = [],
      goals = [],
      topics = [],
    } = await request.json();

    if (!title || !description || !category || !price || !level) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const totalDuration = topics.reduce((sum, topic) => {
      return sum + (topic.videos?.reduce((vSum, video) => vSum + (Number(video.duration) || 0), 0) || 0);
    }, 0);

    await connectDB();
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        title,
        description,
        richDescription: richDescription || "",
        category,
        price: parseFloat(price),
        coverImage: coverImage || "",
        level,
        duration: totalDuration,
        tags: Array.isArray(tags) ? [...new Set(tags)] : [],
        requirements: Array.isArray(requirements)
          ? [...new Set(requirements)]
          : [],
        goals: Array.isArray(goals) ? [...new Set(goals)] : [],
        topics: Array.isArray(topics)
          ? topics.map((topic) => ({
              ...topic,
              videos: Array.isArray(topic.videos) ? topic.videos : [],
            }))
          : [],
      },
      { new: true }
    );

    if (!updatedCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const enrolledCount = await User.countDocuments({ enrolledCourses: id });

    return NextResponse.json({
      message: "Course updated successfully",
      course: {
        id: updatedCourse._id,
        title: updatedCourse.title,
        description: updatedCourse.description,
        richDescription: updatedCourse.richDescription,
        category: updatedCourse.category,
        price: updatedCourse.price,
        coverImage: updatedCourse.coverImage,
        level: updatedCourse.level,
        duration: updatedCourse.duration,
        tags: updatedCourse.tags,
        requirements: updatedCourse.requirements,
        goals: updatedCourse.goals,
        topics: updatedCourse.topics,
        enrolledCount: enrolledCount || 0,
        videoCount: updatedCourse.topics.reduce(
          (acc, topic) => acc + (topic.videos?.length || 0),
          0
        ),
      },
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
    let auth;
    try {
      auth = await verifyAuth(request);
    } catch (authError) {
      return NextResponse.json(
        { error: `Authentication failed: ${authError.message}` },
        { status: 401 }
      );
    }

    if (!auth.role || auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}