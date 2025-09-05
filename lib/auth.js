// lib/auth.js
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import connectDB from "./db";
import User from "./models/User";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("JWT secrets must be defined in environment variables");
}

const encodeSecret = (secret) => {
  try {
    return new TextEncoder().encode(secret);
  } catch (error) {
    throw new Error("Failed to encode JWT secret");
  }
};

export async function generateTokens(user) {
  try {
    const accessToken = await new SignJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role || "student",
      tokenType: "access",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(encodeSecret(JWT_SECRET));

    const refreshToken = await new SignJWT({
      userId: user._id.toString(),
      tokenType: "refresh",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(encodeSecret(REFRESH_TOKEN_SECRET));

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error("Failed to generate tokens");
  }
}

// lib/auth.js
export async function setAuthCookies(tokens, response = null) {
  try {
    if (!tokens.accessToken || !tokens.refreshToken) {
      throw new Error("Invalid tokens provided");
    }

    let res = response || NextResponse.next();

    res.cookies.set("token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    res.cookies.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (error) {
    throw new Error("Failed to set auth cookies");
  }
}

export async function verifyAuth(request) {
  // التحقق من وجود request
  if (!request) {
    throw new Error('Unauthorized: No request object provided');
  }
  
  let token;
  try {
    const cookieStore = await cookies(); 
    token = cookieStore.get('token')?.value;
  } catch (err) {
    // تجاهل الأخطاء في قراءة الكوكيز
  }
  
  // التحقق من وجود headers قبل استخدامها
  if (!token && request.headers) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  
  if (!token) {
    throw new Error('Unauthorized: No token provided');
  }
  
  try {
    const { payload } = await jwtVerify(token, encodeSecret(JWT_SECRET));
    return payload; 
  } catch (err) {
    throw new Error('Unauthorized: Invalid token');
  }
}
export async function refreshAccessToken() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  try {
    const { payload } = await jwtVerify(
      refreshToken.value,
      encodeSecret(REFRESH_TOKEN_SECRET)
    );

    if (payload.tokenType !== "refresh") {
      throw new Error("Invalid refresh token type");
    }

    await connectDB();
    const user = await User.findById(payload.userId).select("role email");
    if (!user) {
      throw new Error("User not found");
    }

    const newAccessToken = await new SignJWT({
      userId: payload.userId,
      email: user.email,
      role: user.role || "student",
      tokenType: "access",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(encodeSecret(JWT_SECRET));

    return {
      newAccessToken,
      user: { id: user._id, role: user.role, email: user.email },
    };
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
}

// lib/auth.js
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("token", { path: "/" });
  cookieStore.delete("refreshToken", { path: "/" });
}
