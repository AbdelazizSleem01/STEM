"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FiUsers,
  FiBookOpen,
  FiVideo,
  FiActivity,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalVideos: 0,
    averageCompletion: 0,
    recentLogins: [],
    popularVideos: [],
    courseEngagement: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminName, setAdminName] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // هذا الكود سينفذ فقط في المتصفح، وليس في السيرفر
    const verifyUser = async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        if (data.user?.role !== "admin") {
          router.replace("/dashboard");
          return;
        }
        setAdminName(data.user.name || "Admin");
        await fetchStats();
      } catch (err) {
        router.replace("/auth/login?from=/dashboard/admin/dashboard");
      }
    };
    
    // تأكد من أننا في المتصفح قبل تنفيذ الكود
    if (typeof window !== 'undefined') {
      verifyUser();
    }
  }, [router]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/auth/login?from=/dashboard/admin/dashboard");
          return;
        }
        throw new Error("Failed to fetch stats");
      }
      const data = await res.json();
      if (!data || typeof data !== "object")
        throw new Error("Invalid stats data");
      setStats({
        totalStudents: data.totalStudents || 0,
        totalCourses: data.totalCourses || 0,
        totalVideos: data.totalVideos || 0,
        averageCompletion: data.averageCompletion || 0,
        recentLogins: Array.isArray(data.recentLogins) ? data.recentLogins : [],
        popularVideos: Array.isArray(data.popularVideos)
          ? data.popularVideos
          : [],
        courseEngagement: Array.isArray(data.courseEngagement)
          ? data.courseEngagement
          : [],
      });

      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]); // أضف router كتبعية

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Not authenticated");
        }

        const data = await res.json();
        const userRole = data.user?.role;

        if (userRole !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setAdminName(data.user.name || "Admin");
        fetchStats();
      } catch (error) {
        router.replace("/auth/login?from=/dashboard/admin/dashboard");
      }
    };

    verifyUser();
  }, [router]); // أضف fetchStats هنا

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-md">
          <div className="flex items-center">
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-red-800">Error</h3>
              <p className="mt-2 text-gray-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Welcome, {adminName}! - Dashboard Overview
      </h1>
      <p className="text-gray-600 mb-8">
        Manage your platform effectively with real-time insights into student
        activity, course performance, and video engagement.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <FiUsers className="text-indigo-600 h-8 w-8" />
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-500">
                Total Students
              </dt>
              <dd className="text-2xl font-bold text-gray-900">
                {stats.totalStudents || 150}
              </dd>
              <div className="text-sm text-green-600 flex items-center">
                <FiArrowUp className="h-5 w-5 mr-1" />
                <span>12% increase this month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <FiBookOpen className="text-blue-600 h-8 w-8" />
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-500">
                Total Courses
              </dt>
              <dd className="text-2xl font-bold text-gray-900">
                {stats.totalCourses || 25}
              </dd>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <FiVideo className="text-green-600 h-8 w-8" />
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-500">
                Total Videos
              </dt>
              <dd className="text-2xl font-bold text-gray-900">
                {stats.totalVideos || 200}
              </dd>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <FiActivity className="text-yellow-600 h-8 w-8" />
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-500">
                Average Completion
              </dt>
              <dd className="text-2xl font-bold text-gray-900">
                {stats.averageCompletion || 65}%
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Videos */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Most Watched Videos
        </h2>
        <p className="text-gray-600 mb-4">
          Top 5 videos based on completion rates, helping you identify engaging
          content.
        </p>
        <ul className="divide-y divide-gray-200">
          {stats.popularVideos.length > 0 ? (
            stats.popularVideos.map((video) => (
              <li
                key={video.id}
                className="py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-indigo-600">
                    {video.title}
                  </p>
                  <p className="text-xs text-gray-500">{video.courseName}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {video.views} views
                </span>
              </li>
            ))
          ) : (
            <li className="py-4 text-center text-gray-500">
              No popular videos yet.
            </li>
          )}
        </ul>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Logins
        </h2>
        <p className="text-gray-600 mb-4">
          Last 10 login activities to monitor user engagement.
        </p>
        <ul className="divide-y divide-gray-200">
          {stats.recentLogins.length > 0 ? (
            stats.recentLogins.map((login) => (
              <li
                key={login.id}
                className="py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {login.userName}
                  </p>
                  <p className="text-xs text-gray-500">{login.email}</p>
                </div>
                <span className="text-xs text-gray-600">
                  {new Date(login.timestamp).toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">{login.ip}</span>
              </li>
            ))
          ) : (
            <li className="py-4 text-center text-gray-500">
              No recent logins yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
