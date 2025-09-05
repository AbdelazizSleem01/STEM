'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiBook, FiLock, FiUnlock, FiPlay, FiVideo, FiClock, FiArrowRight } from 'react-icons/fi';

export default function UserAvailableCoursesPage() {
  const router = useRouter();
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    fetchAvailableCourses();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchAvailableCourses = async () => {
    try {
      const res = await fetch('/api/user/available-courses', {
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 401) {
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });
          if (!refreshRes.ok) {
            router.replace('/auth/login?from=/dashboard/user/available-courses');
            return;
          }
          const retryRes = await fetch('/api/user/available-courses', {
            credentials: 'include',
          });
          if (!retryRes.ok) {
            throw new Error(`Failed to fetch available courses: ${retryRes.statusText}`);
          }
          const retryData = await retryRes.json();
          setAvailableCourses(retryData.availableCourses || []);
          return;
        }
        throw new Error(`Failed to fetch available courses: ${res.statusText}`);
      }
      const data = await res.json();
      setAvailableCourses(data.availableCourses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Not available';
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
      return total + (topic.videos?.reduce((sum, video) => sum + (video.duration || 0), 0) || 0);
    }, 0);
  };

  const handleViewCourse = (courseId) => {
    router.push(`/dashboard/user/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">My Available Courses</h1>
            <p className="mt-2 text-lg text-gray-600">
              Browse and access the courses available to you
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 mb-6 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
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

        {availableCourses.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {availableCourses.map((ac, index) => {
              const availableTopics = ac.course.topics?.filter((topic) =>
                ac.allTopicsAvailable || ac.availableTopics.includes(topic.id)
              ) || [];
              const totalDuration = calculateTotalDuration(availableTopics);

              return (
                <div key={index} className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative">
                    <img
                      src={ac.course.coverImage || '/placeholder-course.jpg'}
                      alt={ac.course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          ac.allTopicsAvailable ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
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
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {ac.course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {ac.course.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <div className="flex items-center mr-4">
                        <FiBook className="ml-1 h-4 w-4" />
                        <span>{availableTopics.length} Topics</span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="ml-1 h-4 w-4" />
                        <span>{formatDuration(totalDuration)}</span>
                      </div>
                    </div>
                    {availableTopics.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                          <FiPlay className="ml-2 h-4 w-4 text-indigo-500" />
                          Available Topics
                        </h4>
                        <ul className="space-y-2">
                          {availableTopics.slice(0, 3).map((topic, topicIndex) => (
                            <li key={topicIndex} className="text-sm text-gray-600 flex items-start">
                              <span className="bg-indigo-100 text-indigo-800 rounded-full p-1 mr-2 mt-0.5">
                                <FiPlay className="h-3 w-3" />
                              </span>
                              <span className="line-clamp-1">{topic.title}</span>
                            </li>
                          ))}
                          {availableTopics.length > 3 && (
                            <li className="text-xs text-gray-500">
                              + {availableTopics.length - 3} more topics
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    <button
                      onClick={() => handleViewCourse(ac.course.id)}
                      className="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                      View Course
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">No available courses</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              You don&apos;t have access to any courses yet. Please contact your administrator to get enrolled in courses.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center rounded-xl border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
