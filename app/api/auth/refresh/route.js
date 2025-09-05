import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { generateTokens, setAuthCookies } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const tokens = await generateTokens(user);

    await setAuthCookies(tokens);

    return NextResponse.json({
      message: "Login successful",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
