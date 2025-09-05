import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Course from "@/lib/models/Course";
import { verifyAuth } from "@/lib/auth";

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    await User.init();
    await Course.init();

    const user = await User.findById(auth.userId)
      .populate({
        path: "availableCourses.course",
        select: "_id title description tags requirements goals coverImage topics",
        match: { _id: { $ne: null } },
        populate: {
          path: "topics",
          select: "id title description orderIndex videos",
          options: { sort: { orderIndex: 1 } },
        },
      })
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const filteredCourses = (user.availableCourses || []).filter(
      (ac) => ac.course !== null && ac.course !== undefined
    );

    const formattedCourses = filteredCourses.map((ac) => {
      const availableTopicsArray = Array.isArray(ac.availableTopics)
        ? ac.availableTopics.map((id) => id.toString())
        : [];

      let processedTopics = [];
      if (ac.course.topics && Array.isArray(ac.course.topics)) {
        processedTopics = ac.course.topics
          .map((topic) => ({
            ...topic,
            id:
              topic.id ||
              topic._id?.toString() ||
              new Date().getTime().toString(),
            videos: (topic.videos || []).map((video, index) => ({
              ...video,
              id:
                video._id?.toString() ||
                `${topic.id || topic._id}-video-${index}`,
              sourceUrl: video.sourceUrl, 
              sourceType: video.sourceType || "youtube",
            })),
          }))
          .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      }

      return {
        course: {
          id: ac.course._id.toString(),
          title: ac.course.title,
          description: ac.course.description,
          coverImage: ac.course.coverImage || "/placeholder-course.jpg",
          topics: processedTopics,
          
          tags: Array.isArray(ac.course.tags) ? ac.course.tags : [],
          requirements: Array.isArray(ac.course.requirements)
            ? ac.course.requirements
            : [],
          goals: Array.isArray(ac.course.goals) ? ac.course.goals : [],
        },
        availableTopics: availableTopicsArray,
        allTopicsAvailable: ac.allTopicsAvailable || false,
      };
    });

    return NextResponse.json({
      availableCourses: formattedCourses,
      userId: auth.userId,
      user: { email: auth.email },
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
