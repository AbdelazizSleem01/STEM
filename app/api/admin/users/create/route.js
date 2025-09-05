import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = auth;
    await connectDB();

    const adminUser = await User.findById(userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, email, temporaryPassword, role, profileImage } = await request.json();

    if (!name || !email || !temporaryPassword || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const newUser = new User({
      name,
      email,
      password: temporaryPassword, 
      role,
      profileImage: profileImage || '',
    });

    await newUser.save();

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}