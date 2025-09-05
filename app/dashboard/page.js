"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FiBook,
  FiLock,
  FiUnlock,
  FiPlay,
  FiClock,
  FiArrowRight,
  FiActivity,
  FiCheckCircle,
  FiClock as FiClockProgress,
  FiUser,
  FiBarChart2,
  FiAward,
  FiSearch,
  FiFilter,
  FiRefreshCw
} from "react-icons/fi";
import Image from "next/image";
export const dynamic = 'force-dynamic'
export default function UserDashboard() {
  const router = useRouter();
  const [availableCourses, setAvailableCourses] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("progress");
  const isMounted = useRef(false);

  useEffect(() => {
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
      fetchStats();
    } catch (err) {
      router.replace("/auth/login?from=/dashboard/admin/dashboard");
    }
  };

  verifyUser();
}, [router, fetchStats]);


  const fetchUserData = async () => {
    try {
      setLoading(true);
      const coursesRes = await fetch("/api/user/available-courses", {
        credentials: "include",
      });

      if (!coursesRes.ok) {
        if (coursesRes.status === 401) {
          const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          });

          if (!refreshRes.ok) {
            throw new Error("Not authenticated");
          }

          const retryRes = await fetch("/api/user/available-courses", {
            credentials: "include",
          });

          if (!retryRes.ok) {
            throw new Error(
              `Failed to fetch available courses: ${retryRes.statusText}`
            );
          }

          const retryData = await retryRes.json();
          setAvailableCourses(retryData.availableCourses || []);
        } else {
          throw new Error(
            `Failed to fetch available courses: ${coursesRes.statusText}`
          );
        }
      } else {
        const data = await coursesRes.json();
        setAvailableCourses(data.availableCourses || []);
      }

      const progressRes = await fetch("/api/user/progress", {
        credentials: "include",
      });

      if (!progressRes.ok) {
        throw new Error(
          `Failed to fetch user progress: ${progressRes.statusText}`
        );
      }

      const progressData = await progressRes.json();
      setUserProgress(progressData.progress || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "Not available";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const calculateTotalDuration = (topics) => {
    return topics.reduce((total, topic) => {
      return (
        total +
        (topic.videos?.reduce((sum, video) => sum + (video.duration || 0), 0) ||
          0)
      );
    }, 0);
  };

  const handleViewCourse = (courseId) => {
    router.push(`/dashboard/user/courses/${courseId}`);
  };

  const getCourseProgress = (courseId) => {
    const progress = userProgress[courseId] || {};
    const totalVideos = availableCourses
      .find((c) => c.course.id === courseId)
      ?.course.topics.reduce((acc, topic) => acc + topic.videos.length, 0);
    const completedVideos = progress.completedVideos?.length || 0;
    const completionRate =
      totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
    const totalWatchTime =
      progress.completedVideos?.reduce(
        (sum, v) => sum + (v.watchedDuration || 0),
        0
      ) || 0;

    return {
      completionRate,
      totalWatchTime,
      completedQuizzes:
        progress.completedQuizzes?.filter((q) => q.completed).length || 0,
      totalQuizzes: progress.completedQuizzes?.length || 0,
    };
  };

  const filteredAndSortedCourses = availableCourses
    .filter((ac) => {
      if (!ac.course) return false;
      return ac.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             ac.course.description.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const progressA = getCourseProgress(a.course.id).completionRate;
      const progressB = getCourseProgress(b.course.id).completionRate;
      
      switch (sortBy) {
        case "progress":
          return progressB - progressA;
        case "title":
          return a.course.title.localeCompare(b.course.title);
        case "duration":
          const durationA = calculateTotalDuration(a.course.topics);
          const durationB = calculateTotalDuration(b.course.topics);
          return durationB - durationA;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FiUser className="text-indigo-600" />
                My Learning Dashboard
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Track your progress and continue your learning journey
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <button
                onClick={fetchUserData}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
              >
                <FiRefreshCw className="h-4 w-4" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 mb-6 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Progress Summary */}
        {Object.keys(userProgress).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <FiActivity className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(
                      Object.values(userProgress).reduce(
                        (sum, p) => sum + (getCourseProgress(p.courseId).completionRate || 0),
                        0
                      ) / Object.keys(userProgress).length
                    )}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiClockProgress className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Watch Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDuration(
                      Object.values(userProgress).reduce(
                        (sum, p) => sum + (getCourseProgress(p.courseId).totalWatchTime || 0),
                        0
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiBook className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{availableCourses.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiAward className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.values(userProgress).filter(p => getCourseProgress(p.courseId).completionRate === 100).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400 h-5 w-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="progress">Sort by Progress</option>
                <option value="title">Sort by Title</option>
                <option value="duration">Sort by Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredAndSortedCourses.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
            {filteredAndSortedCourses.map((ac, index) => {
              if (!ac.course) return null;

              const availableTopics =
                ac.course.topics?.filter(
                  (topic) =>
                    ac.allTopicsAvailable ||
                    ac.availableTopics.includes(topic.id)
                ) || [];
              const totalDuration = calculateTotalDuration(availableTopics);
              const progress = getCourseProgress(ac.course.id);

              return (
                <div
                  key={index}
                  className="flex flex-col bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full"
                >
                  <div className="relative">
                    <Image
                      src={ac.course.coverImage || "/placeholder-course.jpg"}
                      alt={ac.course.title}
                      className="w-full h-48 object-cover"
                      fill
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          ac.allTopicsAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {ac.allTopicsAvailable ? (
                          <>
                            <FiUnlock className="mr-1 h-3 w-3" />
                            All Topics
                          </>
                        ) : (
                          <>
                            <FiLock className="mr-1 h-3 w-3" />
                            {ac.availableTopics?.length || 0} Topics
                          </>
                        )}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-2">
                      <div
                        className="bg-indigo-600 h-2 transition-all duration-300"
                        style={{ width: `${progress.completionRate}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-1 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {ac.course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {ac.course.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <div className="flex items-center mr-4">
                        <FiBook className="mr-1 h-4 w-4" />
                        <span>{availableTopics.length} Topics</span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="mr-1 h-4 w-4" />
                        <span>{formatDuration(totalDuration)}</span>
                      </div>
                    </div>

                    {/* Progress Stats */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-indigo-600">{progress.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.completionRate}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        {/* <span>Watch Time: {formatDuration(progress.totalWatchTime)}</span> */}
                        {/* <span>{progress.completedQuizzes}/{progress.totalQuizzes} Quizzes</span> */}
                      </div>
                    </div>

                    {/* Continue Button */}
                    <button
                      onClick={() => handleViewCourse(ac.course.id)}
                      className="mt-auto w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                      {progress.completionRate > 0 ? 'Continue Learning' : 'Start Learning'}
                      <FiArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <FiBook className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {searchTerm ? 'No courses found' : 'No available courses'}
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms or filters'
                : 'You don\'t have access to any courses yet. Please contact your administrator to get enrolled in courses.'
              }
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSortBy('progress');
                }}
                className="inline-flex items-center rounded-xl border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {searchTerm ? 'Clear Search' : 'Refresh Courses'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}