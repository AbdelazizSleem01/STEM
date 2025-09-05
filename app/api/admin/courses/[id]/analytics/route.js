import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Course from '@/lib/models/Course';
import Analytics from '@/lib/models/Analytics';
import Progress from '@/lib/models/Progress';
import User from '@/lib/models/User';

export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    const { courseId } = params;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'week';

    await connectDB();

    const course = await Course.findById(courseId);
    if (!course || course.instructor.toString() !== auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const now = new Date();
    let startDate = new Date();
    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const [analytics, progress] = await Promise.all([
      Analytics.find({
        course: courseId,
        date: { $gte: startDate }
      }).sort({ date: 1 }),
      Progress.find({
        course: courseId,
        lastAccessedAt: { $gte: startDate }
      }).populate('user', 'name')
    ]);

    const totalStudents = await Progress.countDocuments({ course: courseId });
    const activeStudents = progress.length;
    
    const watchTimeStats = progress.reduce((acc, p) => {
      const videoStats = p.completedVideos.reduce((vacc, v) => ({
        totalTime: vacc.totalTime + (v.watchedDuration || 0),
        totalVideos: vacc.totalVideos + (v.completed ? 1 : 0)
      }), { totalTime: 0, totalVideos: 0 });
      
      return {
        totalTime: acc.totalTime + videoStats.totalTime,
        totalVideos: acc.totalVideos + videoStats.totalVideos
      };
    }, { totalTime: 0, totalVideos: 0 });

    const totalVideos = course.topics.reduce((acc, topic) => 
      acc + topic.videos.length, 0);
    
    const completionRate = Math.round((watchTimeStats.totalVideos / (totalVideos * totalStudents)) * 100);
    const averageWatchTime = totalStudents > 0 ? 
      Math.round(watchTimeStats.totalTime / totalStudents) : 0;

    const startedStudents = await Progress.countDocuments({ course: courseId, startedAt: { $exists: true } });
    const dropoutRate = totalStudents > 0 ? Math.round(((startedStudents - activeStudents) / startedStudents) * 100) : 0;

    const quizPerformance = await Progress.aggregate([
      { $match: { course: courseId } },
      { $unwind: '$completedQuizzes' },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$completedQuizzes.score' },
          completionRate: { $avg: { $cond: [{ $eq: ['$completedQuizzes.completed', true] }, 1, 0] } }
        }
      }
    ]);
    const averageQuizScore = quizPerformance.length ? Math.round(quizPerformance[0].averageScore) : 0;
    const quizCompletionRate = quizPerformance.length ? Math.round(quizPerformance[0].completionRate * 100) : 0;

    const revenue = totalStudents * 10; 

    
    const videoEngagementData = analytics.map(day => ({
      name: day.date.toLocaleDateString(),
      views: day.views,
      completions: day.videoEngagement.reduce((acc, v) => acc + v.completions, 0)
    }));

    const deviceData = aggregateDeviceData(analytics);
    const geoData = aggregateGeoData(analytics);

    const topVideos = course.topics.flatMap(topic => 
      topic.videos.map(video => {
        const videoStats = progress.reduce((acc, p) => {
          const videoProgress = p.completedVideos.find(v => 
            v.video.toString() === video._id.toString()
          );
          if (videoProgress) {
            return {
              views: acc.views + 1,
              watchTime: acc.watchTime + (videoProgress.watchedDuration || 0),
              completions: acc.completions + (videoProgress.completed ? 1 : 0)
            };
          }
          return acc;
        }, { views: 0, watchTime: 0, completions: 0 });

        return {
          id: video._id,
          title: video.title,
          views: videoStats.views,
          averageWatchTime: videoStats.views > 0 ? 
            Math.round(videoStats.watchTime / videoStats.views) : 0,
          completionRate: videoStats.views > 0 ?
            Math.round((videoStats.completions / videoStats.views) * 100) : 0
        };
      })
    ).sort((a, b) => b.views - a.views).slice(0, 5);

    return NextResponse.json({
      totalStudents,
      activeStudents,
      averageWatchTime,
      completionRate,
      dropoutRate,
      averageQuizScore,
      quizCompletionRate,
      revenue,
      videoEngagementData,
      deviceData,
      geoData,
      topVideos
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function aggregateDeviceData(analytics) {
  const devices = analytics.reduce((acc, day) => {
    day.deviceTypes.forEach(device => {
      acc[device.type] = (acc[device.type] || 0) + device.count;
    });
    return acc;
  }, {});

  return Object.entries(devices).map(([name, value]) => ({ name, value }));
}

function aggregateGeoData(analytics) {
  const countries = analytics.reduce((acc, day) => {
    day.geographicData.forEach(geo => {
      acc[geo.country] = (acc[geo.country] || 0) + geo.count;
    });
    return acc;
  }, {});

  return Object.entries(countries)
    .map(([country, students]) => ({ country, students }))
    .sort((a, b) => b.students - a.students)
    .slice(0, 10);
}