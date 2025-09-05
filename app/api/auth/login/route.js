import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { generateTokens, setAuthCookies } from "@/lib/auth";
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();


    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }


    let isValid = false;
    try {
      isValid = await bcrypt.compare(password, user.password);
    } catch (compareError) {
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 500 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    user.lastLogin = new Date();
    user.activeSessions.push({
      deviceFingerprint: request.headers.get("user-agent") || "unknown",
      ip: request.headers.get("x-forwarded-for") || "unknown",
      lastActive: new Date(),
    });

    if (user.activeSessions.length > 10) {
      user.activeSessions = user.activeSessions.slice(-10);
    }

    await user.save();

    const tokens = await generateTokens(user);
    if (!tokens.accessToken || !tokens.refreshToken) {
      throw new Error("Token generation failed");
    }


    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || "student",
      },
      redirect: user.role === "admin" 
        ? "/dashboard/admin/dashboard" 
        : user.role === "instructor"
        ? "/dashboard/instructor"
        : "/dashboard",
    });

    response.cookies.set("token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, 
      path: '/',
    });

    response.cookies.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, 
      path: '/',
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}