"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FiBook,
  FiPlay,
  FiVideo,
  FiArrowLeft,
  FiClock,
  FiLock,
  FiUnlock,
  FiCheckCircle,
  FiTarget,
  FiTag,
  FiList,
  FiAward,
  FiHash,
} from "react-icons/fi";
import VideoPlayer from "@/components/VideoPlayer";
import CourseNotes from "@/components/CourseNotes";
import CourseReviews from "@/components/CourseReviews";

export default function CoursePage() {
  const router = useRouter();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [playbackToken, setPlaybackToken] = useState(null);
  const [watermark, setWatermark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [infoTab, setInfoTab] = useState("requirements"); 

  useEffect(() => {
    const preventDevTools = (e) => {
      if (
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        router.push("/dashboard");
        alert("Developer tools are disabled for security reasons.");
      }
    };

    const preventContextMenu = (e) => {
      e.preventDefault();
      alert("Right-click is disabled for security reasons.");
    };

    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      if (widthThreshold || heightThreshold) {
        router.push("/dashboard");
        alert("Developer tools detected. Redirecting to dashboard.");
      }
    };

    window.addEventListener("keydown", preventDevTools);
    window.addEventListener("contextmenu", preventContextMenu);
    window.addEventListener("resize", detectDevTools);

    if (courseId) {
      fetchCourse();
    }

    return () => {
      window.removeEventListener("keydown", preventDevTools);
      window.removeEventListener("contextmenu", preventContextMenu);
      window.removeEventListener("resize", detectDevTools);
    };
  }, [courseId, router]);

  const generatePlaybackToken = async (videoId) => {
    try {
      const response = await fetch("/api/user/generate-playback-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          courseId,
          videoId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate playback token");
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Error generating playback token:", error);
      return null;
    }
  };

  const fetchCourse = async () => {
    try {
      const res = await fetch("/api/user/available-courses", {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.replace(
            `/auth/login?from=/dashboard/user/courses/${courseId}`
          );
          return;
        }
        throw new Error(`Failed to fetch course: ${res.statusText}`);
      }

      const data = await res.json();

      const courseData = data.availableCourses.find(
        (ac) =>
          ac.course.id === courseId || ac.course.id.toString() === courseId
      );
      if (!courseData) {
        throw new Error("Course not found or not available");
      }

      const processedCourseData = {
        ...courseData,
        course: {
          ...courseData.course,
          topics: courseData.course.topics?.map((topic) => ({
            ...topic,
            videos: topic.videos?.map((video) => ({
              ...video,
              url: video.sourceUrl,
              id: video.id || video._id?.toString(),
            })),
          })),
        },
      };

      setCourse(processedCourseData);
      setWatermark(
        `${data.user?.email || "user"} - ${data.user?.name || "user"} - ${
          new Date().toISOString().split("T")[0]
        }`
      );

      setSelectedVideo(null);
    } catch (err) {
      console.error("Error fetching course:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isVideoAvailable = (courseData, topicId, videoId) => {
    if (courseData.allTopicsAvailable) {
      return true;
    }
    
    const isTopicAvailable = courseData.availableTopics.includes(topicId);
    return isTopicAvailable;
  };

  const handleVideoSelect = async (video, topicId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!video.sourceUrl) {
      setError("Selected video is not available for playback");
      return;
    }

    if (!isVideoAvailable(course, topicId, video.id)) {
      setError("You do not have access to this video");
      return;
    }

    setLoading(true);

    const videoWithCorrectFields = {
      ...video,
      url: video.sourceUrl,
      id: video.id || video._id?.toString(),
    };

    setSelectedVideo(videoWithCorrectFields);

    try {
      const token = await generatePlaybackToken(videoWithCorrectFields.id);
      setPlaybackToken(token);
      setError(null);
    } catch (err) {
      setError("Failed to generate playback token");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }

    setActiveTab("player");
  };

  const handleTimeUpdate = async (currentTime) => {
    if (selectedVideo && currentTime) {
      const watchedPercentage = (currentTime / selectedVideo.duration) * 100;
      if (watchedPercentage >= 90) {
        try {
          await fetch("/api/user/progress/video", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              courseId,
              videoId: selectedVideo.id,
              watchedDuration: currentTime,
              completed: true,
            }),
          });
        } catch (error) {
          console.error("Error updating video progress:", error);
        }
      }
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds === 0) return "Not available";
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
    const availableTopics = topics?.filter((topic) =>
      course.allTopicsAvailable || course.availableTopics.includes(topic.id)
    ) || [];
    return availableTopics.reduce((total, topic) => {
      return total + (topic.videos?.reduce((sum, video) => sum + (video.duration || 0), 0) || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl bg-red-50 p-4 border border-red-200">
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
                <p>{error || "Course not found"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalDuration = calculateTotalDuration(course.course.topics);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 mb-4"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {course.course.title}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {course.course.description}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center">
                <FiBook className="mr-2 h-4 w-4" />
                {course.course.topics?.length || 0} Topics
              </span>
              <span className="flex items-center">
                <FiVideo className="mr-2 h-4 w-4" />
                {course.course.topics?.reduce(
                  (total, topic) => total + (topic.videos?.length || 0),
                  0
                )}{" "}
                Videos
              </span>
              <span className="flex items-center">
                <FiClock className="mr-2 h-4 w-4" />
                Duration: {formatDuration(totalDuration)}
              </span>
            </div>

            {/* Course Info Tabs */}
            <div className="mt-6">
              <nav className="flex space-x-4 mb-4">
                <button
                  onClick={() => setInfoTab("requirements")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center ${
                    infoTab === "requirements"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FiList className="mr-2 h-4 w-4" />
                  Requirements
                </button>
                <button
                  onClick={() => setInfoTab("goals")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center ${
                    infoTab === "goals"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FiTarget className="mr-2 h-4 w-4" />
                  Goals
                </button>
                <button
                  onClick={() => setInfoTab("tags")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center ${
                    infoTab === "tags"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <FiHash className="mr-2 h-4 w-4" />
                  Tags
                </button>
              </nav>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                {infoTab === "requirements" && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <FiList className="mr-2 text-green-500" />
                      Requirements
                    </h3>
                    {course.course.requirements && course.course.requirements.length > 0 ? (
                      <ul className="space-y-2">
                        {course.course.requirements.map((req, index) => (
                          <li
                            key={index}
                            className="flex items-start text-sm text-gray-700 bg-white p-3 rounded-md border border-gray-200"
                          >
                            <FiCheckCircle className="mt-0.5 mr-2 text-green-500 flex-shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 bg-white p-3 rounded-md border border-gray-200">
                        No requirements specified
                      </p>
                    )}
                  </div>
                )}

                {infoTab === "goals" && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <FiTarget className="mr-2 text-blue-500" />
                      Learning Goals
                    </h3>
                    {course.course.goals && course.course.goals.length > 0 ? (
                      <ul className="space-y-2">
                        {course.course.goals.map((goal, index) => (
                          <li
                            key={index}
                            className="flex items-start text-sm text-gray-700 bg-white p-3 rounded-md border border-gray-200"
                          >
                            <FiAward className="mt-0.5 mr-2 text-blue-500 flex-shrink-0" />
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 bg-white p-3 rounded-md border border-gray-200">
                        No goals specified
                      </p>
                    )}
                  </div>
                )}

                {infoTab === "tags" && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <FiHash className="mr-2 text-purple-500" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {course.course.tags && course.course.tags.length > 0 ? (
                        course.course.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                          >
                            <FiTag className="mr-1 text-purple-500" />
                            {tag}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 bg-white p-3 rounded-md border border-gray-200">
                          No tags specified
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
            {["content", "player", "notes", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "content" && "Course Content"}
                {tab === "player" && "Video Player"}
                {tab === "notes" && "My Notes"}
                {tab === "reviews" && "Reviews"}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === "player" && selectedVideo && (
              <>
                <VideoPlayer
                  sourceType={selectedVideo.sourceType}
                  sourceUrl={selectedVideo.sourceUrl}
                  playbackToken={playbackToken}
                  watermark={watermark}
                  onTimeUpdate={handleTimeUpdate}
                  videoDuration={selectedVideo.duration}
                />
                <div className="mt-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedVideo.title}
                  </h3>
                  {selectedVideo.description && (
                    <p className="text-gray-600">{selectedVideo.description}</p>
                  )}
                  {selectedVideo.duration && (
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <FiClock className="mr-2 h-4 w-4" />
                      Duration: {formatDuration(selectedVideo.duration)}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "player" && !selectedVideo && (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
                <FiVideo className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Select a Video to Watch
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  You can choose any available video from the content list on the right.
                </p>
              </div>
            )}

            {activeTab === "notes" && (
              <CourseNotes courseId={courseId} videoId={selectedVideo?.id} />
            )}

            {activeTab === "reviews" && <CourseReviews courseId={courseId} />}
          </div>

          {/* Right Column - Always show course content */}
          <div className="bg-white shadow rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiBook className="mr-2 h-5 w-5" />
              Course Content
            </h3>

            {course.course.topics?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No topics available
              </p>
            ) : (
              <div className="space-y-4">
                {course.course.topics?.map((topic, topicIndex) => {
                  const isTopicAvailable =
                    course.allTopicsAvailable ||
                    course.availableTopics.includes(topic.id);

                  return (
                    <div
                      key={topic.id || topicIndex}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          {topicIndex + 1}. {topic.title}
                        </h4>
                        {isTopicAvailable ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            <FiUnlock className="mr-1 h-3 w-3" />
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                            <FiLock className="mr-1 h-3 w-3" />
                            Locked
                          </span>
                        )}
                      </div>

                      {isTopicAvailable && topic.videos?.length > 0 && (
                        <ul className="space-y-2">
                          {topic.videos.map((video, videoIndex) => {
                            const isVideoAccessible = isVideoAvailable(
                              course,
                              topic.id,
                              video.id
                            );

                            return (
                              <li
                                key={video.id || videoIndex}
                                onClick={(e) =>
                                  isVideoAccessible &&
                                  handleVideoSelect(video, topic.id, e)
                                }
                                className={`flex items-center p-2 rounded-lg transition-colors ${
                                  isVideoAccessible
                                    ? selectedVideo?.id === video.id
                                      ? "bg-indigo-50 border border-indigo-200 cursor-pointer"
                                      : "border border-transparent cursor-pointer hover:bg-gray-50"
                                    : "opacity-50 cursor-not-allowed"
                                }`}
                              >
                                <FiPlay
                                  className={`mr-2 h-4 w-4 flex-shrink-0 ${
                                    isVideoAccessible
                                      ? "text-indigo-500"
                                      : "text-gray-400"
                                  }`}
                                />
                                <span
                                  className={`text-sm flex-1 ${
                                    isVideoAccessible
                                      ? "text-gray-700"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {videoIndex + 1}. {video.title}
                                </span>
                                {video.duration && (
                                  <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">
                                    {formatDuration(video.duration)}
                                  </span>
                                )}
                                {!isVideoAccessible && (
                                  <FiLock className="ml-2 h-4 w-4 text-gray-400" />
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      {isTopicAvailable &&
                        (!topic.videos || topic.videos.length === 0) && (
                          <p className="text-sm text-gray-500">
                            No videos in this topic
                          </p>
                        )}

                      {!isTopicAvailable && (
                        <p className="text-sm text-gray-500">
                          Complete previous topics to unlock
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Show notes and reviews at the bottom when player is active */}
        {activeTab === "player" && selectedVideo && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                My Notes
              </h3>
              <CourseNotes courseId={courseId} videoId={selectedVideo.id} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Course Reviews
              </h3>
              <CourseReviews courseId={courseId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}