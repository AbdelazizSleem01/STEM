"use client";

import { useState } from "react";
import {
  FiBook,
  FiVideo,
  FiList,
  FiTarget,
  FiCheckCircle,
  FiTag,
  FiDollarSign,
  FiBarChart2,
  FiUser,
  FiClock,
  FiAward,
  FiImage,
  FiPlay,
  FiX,
} from "react-icons/fi";

export default function CourseDetails({ course }) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [selectedVideoType, setSelectedVideoType] = useState(null);

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

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";

    try {
      const parsedUrl = new URL(url);
      let videoId = "";

      if (parsedUrl.hostname.includes("youtu.be")) {
        videoId = parsedUrl.pathname.slice(1);
      } else if (
        parsedUrl.hostname.includes("youtube.com") ||
        parsedUrl.hostname.includes("www.youtube.com")
      ) {
        videoId = parsedUrl.searchParams.get("v");
      }

      if (!videoId) return url;
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (err) {
      console.warn("Invalid YouTube URL:", url);
      return url;
    }
  };

  const calculateTotalDuration = (topics) => {
    return (
      topics?.reduce((total, topic) => {
        return (
          total +
          (topic.videos?.reduce(
            (sum, video) => sum + (Number(video.duration) || 0),
            0
          ) || 0)
        );
      }, 0) || 0
    );
  };

  const totalDuration = calculateTotalDuration(course.topics);

  const handlePlayVideo = (sourceUrl, sourceType) => {
    if (sourceUrl) {
      setSelectedVideoUrl(sourceUrl);
      setSelectedVideoType(sourceType);
      setIsVideoModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideoUrl(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center">
        <FiBook className="mr-2 text-indigo-600" />
        Course Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Column */}
        <div className="space-y-6">
          {/* Title */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <FiBook className="mr-2 text-indigo-500" />
              Course Title
            </h4>
            <p className="text-sm text-gray-700 bg-white p-3 rounded-md border border-gray-200">
              {course.title}
            </p>
          </div>

          {/* Short Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <FiBook className="mr-2 text-indigo-500" />
              Short Description
            </h4>
            <p className="text-sm text-gray-700 bg-white p-3 rounded-md border border-gray-200">
              {course.description}
            </p>
          </div>

          {/* Category and Level */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <FiTag className="mr-2 text-indigo-500" />
                Category
              </h4>
              <p className="text-sm text-gray-700 bg-white p-3 rounded-md border border-gray-200">
                {course.category}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <FiBarChart2 className="mr-2 text-indigo-500" />
                Level
              </h4>
              <p className="text-sm text-gray-700 bg-white p-3 rounded-md border border-gray-200 capitalize">
                {course.level}
              </p>
            </div>
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <FiDollarSign className="mr-2 text-indigo-500" />
                Price
              </h4>
              <p className="text-sm text-gray-700 bg-white p-3 rounded-md border border-gray-200">
                ${course.price}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <FiClock className="mr-2 text-indigo-500" />
                Duration
              </h4>
              <p className="text-sm text-gray-700 bg-white p-3 rounded-md border border-gray-200">
                {formatDuration(totalDuration)}
              </p>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <FiImage className="mr-2 text-indigo-500" />
              Cover Image
            </h4>
            <img
              src={course.coverImage || "/placeholder-course.jpg"}
              alt="Course cover"
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
          </div>
        </div>

        {/* Second Column */}
        <div className="space-y-6">
          {/* Requirements */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <FiCheckCircle className="mr-2 text-green-500" />
              Requirements
            </h4>
            <ul className="space-y-2">
              {course.requirements && course.requirements.length > 0 ? (
                course.requirements.map((req, index) => (
                  <li
                    key={index}
                    className="flex items-start text-sm text-gray-700 bg-white p-3 rounded-md border border-gray-200"
                  >
                    <FiCheckCircle className="mt-0.5 mr-2 text-green-500 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-500 bg-white p-3 rounded-md border border-gray-200">
                  No requirements
                </p>
              )}
            </ul>
          </div>

          {/* Goals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <FiTarget className="mr-2 text-blue-500" />
              Learning Goals
            </h4>
            <ul className="space-y-2">
              {course.goals && course.goals.length > 0 ? (
                course.goals.map((goal, index) => (
                  <li
                    key={index}
                    className="flex items-start text-sm text-gray-700 bg-white p-3 rounded-md border border-gray-200"
                  >
                    <FiTarget className="mt-0.5 mr-2 text-blue-500 flex-shrink-0" />
                    <span>{goal}</span>
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-500 bg-white p-3 rounded-md border border-gray-200">
                  No goals specified
                </p>
              )}
            </ul>
          </div>

          {/* Tags */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <FiTag className="mr-2 text-purple-500" />
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {course.tags && course.tags.length > 0 ? (
                course.tags.map((tag, index) => (
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
                  No tags
                </p>
              )}
            </div>
          </div>

          {/* Enrolled Students */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              <FiUser className="mr-2 text-indigo-500" />
              Enrolled Students
            </h4>
            <p className="text-sm text-gray-700 bg-white p-3 rounded-md border border-gray-200">
              {course.enrolledCount || 0} students
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Description */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <FiBook className="mr-2 text-indigo-500" />
          Detailed Description
        </h4>
        <div
          className="text-sm text-gray-700 bg-white p-4 rounded-md border border-gray-200 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: course.richDescription }}
        />
      </div>

      {/* Topics and Videos */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FiList className="mr-2 text-indigo-500" />
          Course Topics
        </h4>

        {course.topics && course.topics.length > 0 ? (
          <div className="space-y-4">
            {course.topics.map((topic, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900 flex items-center">
                    <FiBook className="mr-2 text-indigo-500" />
                    {topic.title}
                  </h5>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                    {topic.videos?.length || 0} video
                    {topic.videos?.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {topic.description && (
                  <p className="text-sm text-gray-500 mb-3">
                    {topic.description}
                  </p>
                )}

                {topic.videos && topic.videos.length > 0 && (
                  <div>
                    <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FiVideo className="mr-2 text-red-500" />
                      Video List
                    </h6>
                    <ul className="space-y-2">
                      {topic.videos.map((video, vIndex) => (
                        <li
                          key={vIndex}
                          className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1">
                              <FiVideo className="mr-2 text-red-500 flex-shrink-0" />
                              <span className="font-medium">{video.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                                {formatDuration(video.duration)}
                              </span>
                              {video.sourceUrl ? (
                                <button
                                  onClick={() =>
                                    handlePlayVideo(
                                      video.sourceUrl,
                                      video.sourceType
                                    )
                                  }
                                  className="inline-flex items-center p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                                  title="Play Video"
                                >
                                  <FiPlay className="h-4 w-4" />
                                </button>
                              ) : (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  Video Unavailable
                                </span>
                              )}
                            </div>
                          </div>
                          {video.description && (
                            <p className="text-xs text-gray-500 mt-1 ml-6">
                              {video.description}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 bg-white p-3 rounded-md border border-gray-200">
            No topics added
          </p>
        )}
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Video Player
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="relative">
              <div className="relative">
                {selectedVideoUrl && selectedVideoType === "youtube" ? (
                  <iframe
                    src={getYouTubeEmbedUrl(selectedVideoUrl)}
                    title="YouTube video player"
                    className="w-full h-[500px] rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video
                    src={selectedVideoUrl}
                    controls
                    autoPlay
                    className="w-full h-auto rounded-lg"
                  />
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
