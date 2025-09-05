import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/lib/models/Course';

export async function GET() {
  try {
    await connectDB();
    
    const courses = await Course.find()
      .select('title description category tags coverImage instructor')
      .populate('instructor', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
