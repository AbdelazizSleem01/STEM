import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  // ✅ تجنب التنفيذ في مرحلة البناء
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({
      success: true,
      user: {
        id: 'build-user-id',
        email: 'build@example.com',
        role: 'admin', // مهم جداً أن تكون 'admin' لأن الصفحة تتطلب صلاحية المدير
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
        name: payload.name || 'User' // أضف اسم المستخدم إذا كان متاحاً
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed', details: error.message },
      { status: 401 }
    );
  }
}