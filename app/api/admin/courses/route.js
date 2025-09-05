import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/lib/models/Course';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    const { userId } = auth;

    await connectDB();
    
    const user = await User.findById(userId);
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const courses = await Course.find({})
      .populate('instructor', 'name email')
      .lean();

    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrolledCount = await User.countDocuments({ enrolledCourses: course._id });
        const videoCount = course.topics?.reduce((acc, topic) => acc + (topic.videos?.length || 0), 0) || 0;
        return {
          id: course._id,
          title: course.title || '',
          description: course.description || '',
          richDescription: course.richDescription || '',
          category: course.category || '',
          price: course.price || 0,
          coverImage: course.coverImage || '',
          level: course.level || 'beginner',
          tags: Array.isArray(course.tags) ? course.tags : [],
          requirements: Array.isArray(course.requirements) ? course.requirements : [],
          goals: Array.isArray(course.goals) ? course.goals : [],
          topics: Array.isArray(course.topics)
            ? course.topics.map((topic) => ({
                id: topic._id, 
                _id: undefined, 
                title: topic.title,
                description: topic.description || '',
                orderIndex: topic.orderIndex || 0,
                videos: Array.isArray(topic.videos) ? topic.videos : [],
              }))
            : [],
          enrolledCount,
          videoCount,
        };
      })
    );

    return NextResponse.json(coursesWithStats);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    const { userId } = auth;

    await connectDB();
    
    const user = await User.findById(userId);
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const {
      title,
      description,
      richDescription,
      category,
      price,
      coverImage,
      level,
      tags = [],
      requirements = [],
      goals = [],
      topics = [],
    } = await request.json();

    // Validate required fields
    if (!title || !description || !category || !price || !level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newCourse = new Course({
      title,
      description,
      richDescription: richDescription || '',
      category,
      price: parseFloat(price),
      coverImage: coverImage || '',
      level,
      tags: Array.isArray(tags) ? tags : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      goals: Array.isArray(goals) ? goals : [],
      topics: Array.isArray(topics)
        ? topics.map((topic) => ({
            ...topic,
            videos: Array.isArray(topic.videos) ? topic.videos : [],
          }))
        : [],
      instructor: userId,
      enrolledCount: 0,
    });

    await newCourse.save();


    const populatedCourse = await Course.findById(newCourse._id)
      .populate('instructor', 'name email')
      .lean();

    return NextResponse.json({
      message: 'Course created successfully',
      course: {
        id: populatedCourse._id,
        title: populatedCourse.title,
        description: populatedCourse.description,
        richDescription: populatedCourse.richDescription,
        category: populatedCourse.category,
        price: populatedCourse.price,
        coverImage: populatedCourse.coverImage,
        level: populatedCourse.level,
        tags: Array.isArray(populatedCourse.tags) ? populatedCourse.tags : [],
        requirements: Array.isArray(populatedCourse.requirements) ? populatedCourse.requirements : [],
        goals: Array.isArray(populatedCourse.goals) ? populatedCourse.goals : [],
        topics: Array.isArray(populatedCourse.topics)
          ? populatedCourse.topics.map((topic) => ({
              id: topic._id, 
              _id: undefined, 
              title: topic.title,
              description: topic.description || '',
              orderIndex: topic.orderIndex || 0,
              videos: Array.isArray(topic.videos) ? topic.videos : [],
            }))
          : [],
        enrolledCount: populatedCourse.enrolledCount || 0,
        videoCount: populatedCourse.topics?.reduce((acc, topic) => acc + (topic.videos?.length || 0), 0) || 0,
        instructor: populatedCourse.instructor,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Course with this title already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}