// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const publicPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/auth/login',
  '/auth/register'
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;

  if (!token) {
    const url = new URL('/auth/login', req.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    if (pathname.startsWith('/dashboard/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (pathname.startsWith('/dashboard/instructor') && payload.role !== 'instructor') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  } catch (err) {
    
    const response = NextResponse.redirect(new URL('/auth/login', req.url));
    response.cookies.delete('token');
    response.cookies.delete('refreshToken');
    return response;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/user/:path*',
    '/api/instructor/:path*'
  ],
};