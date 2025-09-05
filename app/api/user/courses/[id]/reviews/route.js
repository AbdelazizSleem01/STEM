import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Review from "@/lib/models/Review";
import Course from "@/lib/models/Course";
import User from "@/lib/models/User";

export async function GET(request, { params }) {
  try {
    const { id: courseId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");

    await connectDB();

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const reviews = await Review.find({
      course: courseId,
      status: "approved",
    })
      .populate("user", "name profileImage")
      .populate({
        path: "instructorResponse.instructor",
        select: "name",
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const reviewStats = await Review.aggregate([
      {
        $match: {
          course: course._id,
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalReviews = await Review.countDocuments({
      course: courseId,
      status: "approved",
    });

    const averageRating = course.averageRating || 0;

    const ratingBreakdown = [1, 2, 3, 4, 5].map((rating) => {
      const stat = reviewStats.find((s) => s._id === rating);
      return {
        rating,
        count: stat ? stat.count : 0,
        percentage: totalReviews > 0 ? Math.round((stat ? stat.count : 0) / totalReviews * 100) : 0,
      };
    });

    return NextResponse.json({
      reviews,
      stats: {
        totalReviews,
        averageRating,
        ratingBreakdown,
      },
      pagination: {
        currentPage: Math.floor(skip / limit) + 1,
        hasNextPage: skip + limit < totalReviews,
        hasPrevPage: skip > 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = params;
    const { rating, review } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (!review || review.trim().length === 0) {
      return NextResponse.json(
        { error: "Review content is required" },
        { status: 400 }
      );
    }

    if (review.length > 1000) {
      return NextResponse.json(
        { error: "Review must be less than 1000 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const user = await User.findById(auth.userId).populate("availableCourses.course");
    const hasAccess = user.availableCourses.some(
      (ac) => ac.course && ac.course._id.toString() === courseId
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You must have access to this course to leave a review" },
        { status: 403 }
      );
    }

    const existingReview = await Review.findOne({
      user: auth.userId,
      course: courseId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this course" },
        { status: 400 }
      );
    }

    const newReview = new Review({
      user: auth.userId,
      course: courseId,
      rating: parseInt(rating),
      review: review.trim(),
      status: "approved",
    });

    await newReview.save();

    const savedReview = await Review.findById(newReview._id).populate(
      "user",
      "name profileImage"
    );

    return NextResponse.json({
      message: "Review added successfully",
      review: savedReview,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = params;
    const { reviewId, rating, review: newReview } = await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (newReview && newReview.length > 1000) {
      return NextResponse.json(
        { error: "Review must be less than 1000 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingReview = await Review.findOne({
      _id: reviewId,
      user: auth.userId,
      course: courseId,
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "Review not found or access denied" },
        { status: 404 }
      );
    }

    if (rating) existingReview.rating = parseInt(rating);
    if (newReview) existingReview.review = newReview.trim();
    existingReview.status = "approved";

    await existingReview.save();

    const updatedReview = await Review.findById(reviewId).populate(
      "user",
      "name profileImage"
    );

    return NextResponse.json({
      message: "Review updated successfully",
      review: updatedReview,
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
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = params;
    const { reviewId } = await request.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const deletedReview = await Review.findOneAndDelete({
      _id: reviewId,
      user: auth.userId,
      course: courseId,
    });

    if (!deletedReview) {
      return NextResponse.json(
        { error: "Review not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}