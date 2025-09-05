import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Course from '@/lib/models/Course';
import { verifyAuth } from '@/lib/auth';

// GET - Get user's enrolled courses and progress
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    const { userId } = auth;

    await connectDB();

    const user = await User.findById(userId)
      .populate('courses', 'title description coverImage instructor');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get enrolled courses with progress
    const enrolledCourses = await Promise.all(
      user.courses.map(async (course) => {
        // Calculate progress
        const progress = await calculateCourseProgress(userId, course._id);

        return {
          id: course._id,
          title: course.title,
          description: course.description,
          thumbnail: course.coverImage,
          progress: progress
        };
      })
    );

    // Get recently watched video
    const recentlyWatched = user.watchHistory.length > 0 ? user.watchHistory[0] : null;

    // Get user notes
    const notes = await User.aggregate([
      { $match: { _id: user._id } },
      { $unwind: '$notes' },
      { $sort: { 'notes.createdAt': -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          id: '$notes._id',
          content: '$notes.content',
          createdAt: '$notes.createdAt',
          course: '$notes.course',
          video: '$notes.video'
        }
      }
    ]);

    const progress = {
      hoursWatched: calculateHoursWatched(user.watchHistory),
      completedCourses: calculateCompletedCourses(enrolledCourses),
      daysActive: calculateDaysActive(user.watchHistory)
    };

    return NextResponse.json({
      enrolledCourses,
      recentlyWatched,
      progress,
      notes
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculateCourseProgress(userId, courseId) {
  try {
    const watchHistory = await User.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$watchHistory' },
      { $match: { 'watchHistory.course': courseId } },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          watchedVideos: { $sum: { $cond: ['$watchHistory.lastPosition', 1, 0] } }
        }
      }
    ]);

    if (watchHistory.length === 0 || watchHistory[0].totalVideos === 0) {
      return 0;
    }

    return Math.round((watchHistory[0].watchedVideos / watchHistory[0].totalVideos) * 100);
  } catch (error) {
    return 0;
  }
}

function calculateHoursWatched(watchHistory) {
  if (!watchHistory || watchHistory.length === 0) return 0;

  return watchHistory.length * 0.5; 
}

function calculateCompletedCourses(enrolledCourses) {
  return enrolledCourses.filter(course => course.progress === 100).length;
}

function calculateDaysActive(watchHistory) {
  if (!watchHistory || watchHistory.length === 0) return 0;

  const uniqueDates = new Set(
    watchHistory.map(item => {
      const date = new Date(item.lastWatched);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    })
  );

  return uniqueDates.size;
}
