// app/privacy/page.js
import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PrivacyClient from "@/components/PrivacyClient";

export default async function PrivacyPage() {
  let user = null;

  try {
    const payload = await verifyAuth();
    user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch (err) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/refresh`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }
      );

      if (res.ok) {
        const data = await res.json();
        user = data.user;
      } else {
        return redirect("/auth/login");
      }
    } catch {
      return redirect("/auth/login");
    }
  }

  return <PrivacyClient user={user} />;
}
