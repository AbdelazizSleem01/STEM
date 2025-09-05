import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { verifyAuth } from "@/lib/auth";

// GET all users
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userId } = auth;

    await connectDB();

    const adminUser = await User.findById(userId);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // جلب المستخدمين مع الكورسات المتاحة
    const users = await User.find({})
      .select("name email role profileImage availableCourses createdAt updatedAt")
      .populate({
        path: "availableCourses.course",
        select: "title description topics",
        populate: {
          path: "topics",
          select: "title videos"
        }
      });

    // تنسيق البيانات للإرجاع
    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      availableCourses: user.availableCourses.map(ac => ({
        course: {
          _id: ac.course?._id,
          id: ac.course?._id?.toString(),
          title: ac.course?.title,
          description: ac.course?.description,
          topics: ac.course?.topics || []
        },
        availableTopics: ac.availableTopics || [],
        allTopicsAvailable: ac.allTopicsAvailable || false
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}