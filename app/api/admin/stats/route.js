import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Course from '@/lib/models/Course';
import Progress from '@/lib/models/Progress';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.userId || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const [
      totalStudents,
      totalCourses,
      totalVideos,
      progress
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      Course.aggregate([
        { $unwind: '$topics' },
        { $unwind: '$topics.videos' },
        { $count: 'total' }
      ]),
      Progress.aggregate([
        {
          $group: {
            _id: null,
            averageProgress: { $avg: '$progress' }
          }
        }
      ])
    ]);

    const popularVideos = await Progress.aggregate([
      { $unwind: '$completedVideos' },
      {
        $group: {
          _id: '$completedVideos.video',
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'topics.videos._id',
          as: 'courseInfo'
        }
      }
    ]);

    const recentLogins = await User.aggregate([
      { $sort: { lastLogin: -1 } },
      { $limit: 10 },
      {
        $project: {
          userName: '$name',
          email: 1,
          lastLogin: 1,
          ip: { $arrayElemAt: ['$activeSessions.ip', -1] }
        }
      }
    ]);

    return NextResponse.json({
      totalStudents,
      totalCourses,
      totalVideos: totalVideos[0]?.total || 0,
      averageCompletion: Math.round(progress[0]?.averageProgress || 0),
      popularVideos: popularVideos.map(v => ({
        id: v._id,
        title: v.courseInfo[0]?.topics[0]?.videos[0]?.title || 'Unknown Video',
        views: v.views,
        courseName: v.courseInfo[0]?.title || 'Unknown Course'
      })),
      recentLogins: recentLogins.map(login => ({
        id: login._id,
        userName: login.userName,
        email: login.email,
        timestamp: login.lastLogin,
        ip: login.ip
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
