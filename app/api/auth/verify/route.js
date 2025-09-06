// app/api/auth/verify/route.js
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  // ✅ تجنب التنفيذ في مرحلة البناء
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_RUNTIME) {
    return NextResponse.json({
      success: true,
      user: {
        id: 'build-user-id',
        email: 'build@example.com',
        role: 'admin',
        name: 'Build Admin'
      }
    });
  }

  try {
    const payload = await verifyAuth(request);

    return NextResponse.json({
      success: true,
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        name: payload.name || 'User'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed', details: error.message },
      { status: 401 }
    );
  }
}

// ✅ مهم: لو بعت POST بالغلط — حوله لـ GET
export async function POST(request) {
  return GET(request);
}