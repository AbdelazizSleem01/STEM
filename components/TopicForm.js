"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import CloudinaryUpload from "./CloudinaryUpload";

export default function TopicForm({
  initialTopic,
  onSave,
  onCancel,
  topicIndex,
}) {
  const [topic, setTopic] = useState(
    initialTopic || {
      title: "",
      description: "",
      orderIndex: topicIndex !== null ? topicIndex : 0,
      videos: [],
    }
  );
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoIndex, setVideoIndex] = useState(null);
  const [error, setError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleTopicChange = (e) => {
    const { name, value } = e.target;
    setTopic((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVideo = () => {
    setCurrentVideo({
      title: "",
      description: "",
      sourceType: "youtube",
      sourceUrl: "",
      orderIndex: topic.videos.length,
    });
    setVideoIndex(null);
    setShowVideoForm(true);
  };

  const handleEditVideo = (video, index) => {
    setCurrentVideo(video);
    setVideoIndex(index);
    setShowVideoForm(true);
  };

  const handleDeleteVideo = (index) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    setTopic((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const handleSaveVideo = async () => {
    if (!currentVideo.title || !currentVideo.sourceUrl) {
      setError("Video title and URL are required");
      return;
    }

    setFormLoading(true);
    setError(null);

    try {
      let updatedVideo = { ...currentVideo };

      if (currentVideo.sourceType === "youtube") {
        const res = await fetch(
          `/api/youtube/video-info?url=${encodeURIComponent(
            currentVideo.sourceUrl
          )}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.error || "Failed to fetch YouTube video info"
          );
        }

        const metadata = await res.json();
        updatedVideo = {
          ...updatedVideo,
          duration: metadata.duration,
          thumbnails: metadata.thumbnails,
        };
      } else {
        if (!currentVideo.sourceUrl.includes("cloudinary.com")) {
          setError("Invalid video URL. Please upload via Cloudinary.");
          setFormLoading(false);
          return;
        }
      }

      setTopic((prev) => {
        const newVideos = [...prev.videos];
        if (videoIndex !== null) {
          newVideos[videoIndex] = updatedVideo;
        } else {
          newVideos.push(updatedVideo);
        }
        return { ...prev, videos: newVideos };
      });

      setCurrentVideo(null);
      setShowVideoForm(false);
      setVideoIndex(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.title) {
      setError("Topic title is required");
      return;
    }

    onSave({
      ...topic,
      orderIndex: topic.orderIndex,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-8 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {topicIndex !== null ? "Edit Topic" : "Add New Topic"}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Topic Title
            </label>
            <input
              type="text"
              name="title"
              value={topic.title}
              onChange={handleTopicChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              required
              placeholder="Enter topic title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={topic.description}
              onChange={handleTopicChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="Enter topic description"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Videos
              </label>
              <button
                type="button"
                onClick={handleAddVideo}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Add Video
              </button>
            </div>
            <div className="space-y-3">
              {topic.videos.map((video, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-md"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-12 w-20">
                      <img
                        src={
                          video.thumbnails?.default || "/placeholder-video.jpg"
                        }
                        alt={video.title}
                        className="h-full w-full object-cover rounded"
                      />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">
                        {video.title}
                      </h5>
                      <p className="text-xs text-gray-500">
                        {video.description}
                      </p>
                      {video.duration && (
                        <p className="text-xs text-gray-500">
                          {`${Math.floor(video.duration / 60)}:${(
                            video.duration % 60
                          )
                            .toString()
                            .padStart(2, "0")}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => handleEditVideo(video, index)}
                      className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                      title="Edit Video"
                    >
                      <FiEdit2 className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                      title="Delete Video"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={formLoading}
              className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
            >
              {formLoading ? "Saving..." : "Save Topic"}
            </button>
          </div>
        </form>

        {showVideoForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-8 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {videoIndex !== null ? "Edit Video" : "Add New Video"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowVideoForm(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Video Title
                  </label>
                  <input
                    type="text"
                    value={currentVideo.title}
                    onChange={(e) =>
                      setCurrentVideo((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    required
                    placeholder="Enter video title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={currentVideo.description}
                    onChange={(e) =>
                      setCurrentVideo((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    placeholder="Enter video description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Source Type
                  </label>
                  <select
                    value={currentVideo.sourceType}
                    onChange={(e) =>
                      setCurrentVideo((prev) => ({
                        ...prev,
                        sourceType: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    required
                  >
                    <option value="youtube">YouTube</option>
                    <option value="hosted">Hosted Video</option>
                  </select>
                </div>
                {currentVideo.sourceType === "youtube" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      value={currentVideo.sourceUrl}
                      onChange={(e) =>
                        setCurrentVideo((prev) => ({
                          ...prev,
                          sourceUrl: e.target.value,
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                      required
                      placeholder="Enter YouTube video URL"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Video File
                    </label>
                    <CloudinaryUpload
                      onUpload={(url, duration) =>
                        setCurrentVideo((prev) => ({
                          ...prev,
                          sourceUrl: url,
                          duration,
                        }))
                      }
                      value={currentVideo.sourceUrl}
                      resourceType="video"
                    />
                    {currentVideo.sourceUrl && (
                      <video
                        src={currentVideo.sourceUrl}
                        className="mt-2 w-full rounded-md border"
                        controls
                      />
                    )}
                  </div>
                )}
                {currentVideo.duration && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Video Duration
                    </label>
                    <p className="mt-1 text-sm text-gray-500">
                      {`${Math.floor(currentVideo.duration / 60)}:${(
                        currentVideo.duration % 60
                      )
                        .toString()
                        .padStart(2, "0")}`}
                    </p>
                  </div>
                )}
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowVideoForm(false)}
                    disabled={formLoading}
                    className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveVideo}
                    disabled={formLoading}
                    className="rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                  >
                    {formLoading ? "Saving..." : "Save Video"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}