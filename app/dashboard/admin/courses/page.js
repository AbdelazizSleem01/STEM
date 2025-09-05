"use client";

import { useState, useEffect } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiVideo,
  FiUsers,
  FiX,
  FiEye,
  FiClock,
} from "react-icons/fi";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import SimpleEditor from "@/components/SimpleEditor";
import CourseDetails from "@/components/CourseDetails";
import TopicForm from "@/components/TopicForm";

export default function CourseManagementPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    richDescription: "",
    category: "",
    price: "",
    coverImage: "",
    level: "beginner",
    duration: 0,
    tags: [],
    requirements: [],
    goals: [],
    topics: [],
  });
  const [currentTag, setCurrentTag] = useState("");
  const [currentRequirement, setCurrentRequirement] = useState("");
  const [currentGoal, setCurrentGoal] = useState("");
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [activeTopicIndex, setActiveTopicIndex] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailsCourse, setSelectedDetailsCourse] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    return topics.reduce((sum, topic) => {
      return (
        sum +
        (topic.videos || []).reduce(
          (vSum, video) => vSum + (Number(video.duration) || 0),
          0
        )
      );
    }, 0);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch courses: ${res.statusText}`);
      }
      const data = await res.json();
      setCourses(
        Array.isArray(data)
          ? data.map((course) => ({
              ...course,
              tags: Array.isArray(course.tags) ? [...new Set(course.tags)] : [],
              requirements: Array.isArray(course.requirements)
                ? [...new Set(course.requirements)]
                : [],
              goals: Array.isArray(course.goals)
                ? [...new Set(course.goals)]
                : [],
              topics: Array.isArray(course.topics)
                ? course.topics.map((topic) => ({
                    ...topic,
                    videos: Array.isArray(topic.videos) ? topic.videos : [],
                  }))
                : [],
              enrolledCount: course.enrolledCount || 0,
            }))
          : []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title || "",
      description: course.description || "",
      richDescription: course.richDescription || "",
      price: course.price || "",
      coverImage: course.coverImage || "",
      category: course.category || "",
      level: course.level || "beginner",
      duration: course.duration || 0,
      tags: Array.isArray(course.tags) ? [...new Set(course.tags)] : [],
      requirements: Array.isArray(course.requirements)
        ? [...new Set(course.requirements)]
        : [],
      goals: Array.isArray(course.goals) ? [...new Set(course.goals)] : [],
      topics: Array.isArray(course.topics)
        ? course.topics.map((topic) => ({
            ...topic,
            videos: Array.isArray(topic.videos) ? topic.videos : [],
          }))
        : [],
    });
    setIsEditModalOpen(true);
  };

  const handleEnrollStudent = async (courseId) => {
    const userId = prompt("Enter the user ID to enroll:");
    if (!userId) return;

    try {
      const res = await fetch(`/api/admin/courses/${courseId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to enroll student");
      }

      alert("Student enrolled successfully!");
      await fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const handleAddRequirement = () => {
    if (
      currentRequirement.trim() &&
      !formData.requirements.includes(currentRequirement.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...(prev.requirements || []), currentRequirement.trim()],
      }));
      setCurrentRequirement("");
    }
  };

  const handleAddGoal = () => {
    if (currentGoal.trim() && !formData.goals.includes(currentGoal.trim())) {
      setFormData((prev) => ({
        ...prev,
        goals: [...(prev.goals || []), currentGoal.trim()],
      }));
      setCurrentGoal("");
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRequirementKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddRequirement();
    }
  };

  const handleGoalKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddGoal();
    }
  };

  const removeTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((_, i) => i !== index),
    }));
  };

  const removeRequirement = (index) => {
    setFormData((prev) => ({
      ...prev,
      requirements: (prev.requirements || []).filter((_, i) => i !== index),
    }));
  };

  const removeGoal = (index) => {
    setFormData((prev) => ({
      ...prev,
      goals: (prev.goals || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormLoading(true);
    setError(null);
    try {
      const totalDuration = calculateTotalDuration(formData.topics);

      const courseData = { ...formData, duration: totalDuration };

      const res = await fetch(
        selectedCourse
          ? `/api/admin/courses/${selectedCourse.id}`
          : "/api/admin/courses",
        {
          method: selectedCourse ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(courseData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save course");
      }

      await fetchCourses();
      setIsEditModalOpen(false);
      setSelectedCourse(null);
      setFormData({
        title: "",
        description: "",
        richDescription: "",
        category: "",
        price: "",
        coverImage: "",
        level: "beginner",
        duration: 0,
        tags: [],
        requirements: [],
        goals: [],
        topics: [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const deleteCourse = async (courseId) => {
    if (
      !confirm(
        "Are you sure you want to delete this course? This will remove access for all enrolled students."
      )
    )
      return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete course");
      }
      await fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleThumbnailUpload = (url) => {
    setFormData((prev) => ({ ...prev, coverImage: url }));
  };

  const handleAddTopic = () => {
    setCurrentTopic({
      title: "",
      description: "",
      orderIndex: formData.topics.length,
      videos: [],
    });
    setActiveTopicIndex(null);
    setShowTopicForm(true);
  };

  const handleEditTopic = (topic, index) => {
    setCurrentTopic({
      ...topic,
      orderIndex: index,
    });
    setActiveTopicIndex(index);
    setShowTopicForm(true);
  };

  const handleSaveTopic = (topicData) => {
    setFormData((prev) => {
      const newTopics = [...(prev.topics || [])];
      if (activeTopicIndex !== null) {
        newTopics[activeTopicIndex] = {
          ...topicData,
          orderIndex: activeTopicIndex,
        };
      } else {
        newTopics.push({
          ...topicData,
          orderIndex: newTopics.length,
        });
      }
      return { ...prev, topics: newTopics };
    });
    setShowTopicForm(false);
    setCurrentTopic(null);
    setActiveTopicIndex(null);
  };

  const handleDeleteTopic = (index) => {
    if (
      !confirm("Are you sure you want to delete this topic and all its videos?")
    )
      return;
    setFormData((prev) => ({
      ...prev,
      topics: (prev.topics || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddVideo = (topicIndex) => {
    setCurrentTopic({
      ...formData.topics[topicIndex],
      orderIndex: topicIndex,
    });
    setActiveTopicIndex(topicIndex);
    setShowTopicForm(true);
  };

  const handleEditVideo = (video, topicIndex, videoIndex) => {
    setCurrentTopic({
      ...formData.topics[topicIndex],
      orderIndex: topicIndex,
    });
    setActiveTopicIndex(topicIndex);
    setShowTopicForm(true);
  };

  const handleDeleteVideo = (topicIndex, videoIndex) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    setFormData((prev) => {
      const newTopics = [...(prev.topics || [])];
      newTopics[topicIndex].videos = (
        newTopics[topicIndex]?.videos || []
      ).filter((_, i) => i !== videoIndex);
      return { ...prev, topics: newTopics };
    });
  };

  const handleTopicDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = formData.topics.findIndex(
        (_, index) => `topic-${index}` === active.id
      );
      const newIndex = formData.topics.findIndex(
        (_, index) => `topic-${index}` === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedTopics = arrayMove(formData.topics, oldIndex, newIndex);
        const updatedTopics = reorderedTopics.map((topic, index) => ({
          ...topic,
          orderIndex: index,
        }));
        setFormData((prev) => ({ ...prev, topics: updatedTopics }));
      }
    }
  };

  const handleVideoDragEnd = (updatedVideos, topicIndex) => {
    setFormData((prev) => {
      const newTopics = [...(prev.topics || [])];
      newTopics[topicIndex] = {
        ...newTopics[topicIndex],
        videos: updatedVideos,
      };
      return { ...prev, topics: newTopics };
    });
  };

  const handleViewDetails = (course) => {
    setSelectedDetailsCourse(course);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            Course Management
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage educational courses, content, and enrollment details
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setSelectedCourse(null);
              setFormData({
                title: "",
                description: "",
                richDescription: "",
                category: "",
                price: "",
                coverImage: "",
                level: "beginner",
                duration: 0,
                tags: [],
                requirements: [],
                goals: [],
                topics: [],
              });
              setIsEditModalOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto transition-colors duration-200"
          >
            <FiPlus className="mr-2" />
            Add Course
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mt-4">
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

      <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const totalDuration = calculateTotalDuration(course.topics);
          return (
            <div
              key={course.id}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={course.coverImage || "/placeholder-course.jpg"}
                  alt={course.title}
                  className="object-cover w-full h-48"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {course.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {course.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  {/* <div className="flex items-center text-sm text-gray-500">
                    <FiUsers className="mr-1" />
                    {course.enrolledCount || 0} Students
                  </div> */}
                  <div className="flex items-center text-sm text-gray-500">
                    <FiVideo className="mr-1" />
                    {course.videoCount || 0} Videos
                  </div>
                  <div className="flex items-center text-sm text-indigo-500">
                    <FiClock className="mr-1" />
                    {formatDuration(totalDuration)}
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-medium text-indigo-700">
                    ${course.price}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEditCourse(course)}
                    className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    title="Edit Course"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCourse(course.id)}
                    className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    title="Delete Course"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewDetails(course)}
                    className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    title="View Details"
                  >
                    <FiEye className="h-4 w-4" />
                  </button>
                  {/* <button
                    type="button"
                    onClick={() => handleEnrollStudent(course.id)}
                    className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    title="Enroll Student"
                  >
                    <FiUsers className="h-4 w-4" />
                  </button> */}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedCourse ? "Edit Course" : "Add New Course"}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Course Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    required
                    placeholder="Enter course title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Short Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    required
                    placeholder="Enter a short description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Detailed Description
                  </label>
                  <SimpleEditor
                    value={formData.richDescription}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        richDescription: value,
                      }))
                    }
                    className="mt-1 border rounded-md p-2 min-h-[200px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    required
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="programming">Programming</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="science">Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Level
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cover Image
                  </label>
                  <CloudinaryUpload
                    onUpload={handleThumbnailUpload}
                    resourceType="image"
                    value={formData.coverImage}
                  />
                  {formData.coverImage && (
                    <img
                      src={formData.coverImage}
                      alt="Course cover image"
                      className="mt-2 h-40 w-full object-cover rounded-md border"
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Enter a tag"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!currentTag.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(formData.tags || []).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-200 hover:bg-indigo-300 focus:outline-none transition-colors duration-200"
                        >
                          <FiX className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Requirements
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={currentRequirement}
                      onChange={(e) => setCurrentRequirement(e.target.value)}
                      onKeyDown={handleRequirementKeyDown}
                      placeholder="Enter a requirement"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    <button
                      type="button"
                      onClick={handleAddRequirement}
                      disabled={!currentRequirement.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {(formData.requirements || []).map((req, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-md"
                      >
                        <span className="text-sm text-gray-700">{req}</span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Learning Goals
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={currentGoal}
                      onChange={(e) => setCurrentGoal(e.target.value)}
                      onKeyDown={handleGoalKeyDown}
                      placeholder="Enter a learning goal"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    <button
                      type="button"
                      onClick={handleAddGoal}
                      disabled={!currentGoal.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {(formData.goals || []).map((goal, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-md"
                      >
                        <span className="text-sm text-gray-700">{goal}</span>
                        <button
                          type="button"
                          onClick={() => removeGoal(index)}
                          className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Topics
                    </label>
                    <button
                      type="button"
                      onClick={handleAddTopic}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      Add Topic
                    </button>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleTopicDragEnd}
                  >
                    <SortableContext
                      items={formData.topics.map(
                        (_, index) => `topic-${index}`
                      )}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="mt-2 space-y-4">
                        {formData.topics.map((topic, index) => (
                          <SortableTopic
                            key={`topic-${index}`}
                            topic={topic}
                            index={index}
                            onEdit={handleEditTopic}
                            onDelete={handleDeleteTopic}
                            onAddVideo={handleAddVideo}
                            onEditVideo={handleEditVideo}
                            onDeleteVideo={handleDeleteVideo}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className={`rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 ${
                    formLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {formLoading
                    ? "Saving..."
                    : selectedCourse
                    ? "Save Changes"
                    : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTopicForm && (
        <TopicForm
          initialTopic={currentTopic}
          onSave={handleSaveTopic}
          onCancel={() => {
            setShowTopicForm(false);
            setCurrentTopic(null);
            setActiveTopicIndex(null);
          }}
          topicIndex={activeTopicIndex}
        />
      )}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Course Details
              </h3>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <CourseDetails course={selectedDetailsCourse} />
          </div>
        </div>
      )}
    </div>
  );
}

function SortableTopic({
  topic,
  index,
  onEdit,
  onDelete,
  onAddVideo,
  onEditVideo,
  onDeleteVideo,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: `topic-${index}` });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="cursor-move"
      >
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">{topic.title}</h4>
          <p className="text-sm text-gray-500">{topic.description}</p>
        </div>
      </div>
      <div className="flex space-x-2 mt-2">
        <button
          type="button"
          onClick={() => onEdit(topic, index)}
          className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50 transition-colors"
          title="Edit Topic"
        >
          <FiEdit2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
          title="Delete Topic"
        >
          <FiTrash2 className="h-4 w-4" />
        </button>
      </div>

      {topic.videos && topic.videos.length > 0 && (
        <div className="mt-3 border-t pt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-600">Videos:</span>
            <button
              type="button"
              onClick={() => onAddVideo(index)}
              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <FiPlus className="h-3 w-3 mr-1" />
              Add Video
            </button>
          </div>
          <div className="space-y-2">
            {topic.videos.map((video, videoIndex) => (
              <div
                key={videoIndex}
                className="flex justify-between items-center bg-white p-2 rounded border text-xs"
              >
                <div className="flex-1 truncate">
                  <span className="font-medium">{video.title}</span>
                  {video.duration && (
                    <span className="ml-2 text-gray-500">
                      ({Math.floor(video.duration / 60)}:
                      {(video.duration % 60).toString().padStart(2, "0")})
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => onEditVideo(video, index, videoIndex)}
                    className="text-indigo-600 hover:text-indigo-800"
                    title="Edit Video"
                  >
                    <FiEdit2 className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteVideo(index, videoIndex)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete Video"
                  >
                    <FiTrash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
