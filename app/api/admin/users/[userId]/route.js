import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminId = auth.userId; 
    const targetUserId = params.userId; 

    await connectDB();

    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, email, role, profileImage } = await request.json();

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { name, email, role, profileImage },
      { new: true }
    ).select('name email role profileImage');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminId = auth.userId;
    const targetUserId = params.userId;

    await connectDB();

    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const deletedUser = await User.findByIdAndDelete(targetUserId);
    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
