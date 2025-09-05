import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete("token", { path: "/" });
  cookieStore.delete("refreshToken", { path: "/" });

  return NextResponse.json({ message: "Logged out successfully" });
}
