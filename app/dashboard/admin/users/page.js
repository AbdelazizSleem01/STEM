"use client";

export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiBook,
  FiCheck,
  FiUser,
  FiMail,
  FiKey,
  FiX,
  FiUsers,
  FiBookOpen,
  FiLock,
  FiUnlock,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignCourseModalOpen, setIsAssignCourseModalOpen] = useState(false);
  const [isAvailableCourseModalOpen, setIsAvailableCourseModalOpen] =
    useState(false);
  const [selectedCourseTopics, setSelectedCourseTopics] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [allTopicsAvailable, setAllTopicsAvailable] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    temporaryPassword: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchData = async () => {
      await fetchUsers();
      await fetchCourses();
    };
    fetchData();
  }, []); 

  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (
      isEditModalOpen ||
      isAssignCourseModalOpen ||
      isAvailableCourseModalOpen
    ) {
      setError(null);
    }
  }, [isEditModalOpen, isAssignCourseModalOpen, isAvailableCourseModalOpen]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/auth/login?from=/dashboard/admin/users");
          return;
        }
        throw new Error(`Failed to fetch users: ${res.statusText}`);
      }
      const data = await res.json();
      setUsers(
        Array.isArray(data.users) ? data.users.filter((user) => user._id) : []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch courses: ${res.statusText}`);
      }
      const data = await res.json();
      const validCourses = Array.isArray(data)
        ? data.filter((course) => course.id)
        : [];
      if (validCourses.length !== data.length) {
      }
      setCourses(validCourses);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      await fetchUsers();
      setFormData({
        name: "",
        email: "",
        role: "student",
        temporaryPassword: "",
      });
      setIsEditModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          ...(formData.temporaryPassword && {
            temporaryPassword: formData.temporaryPassword,
          }),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      await fetchUsers();
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setFormData({
        name: "",
        email: "",
        role: "student",
        temporaryPassword: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      temporaryPassword: "",
    });
    setIsEditModalOpen(true);
  };

  const handleAssignCourse = (user) => {
    setSelectedUser(user);
    setIsAssignCourseModalOpen(true);
  };

  const handleAvailableCourses = async (user) => {
    if (!user || !user._id) {
      setError("No valid user selected");
      return;
    }

    setSelectedUser(user);
    try {
      const res = await fetch(
        `/api/admin/users/${user._id}/available-courses`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error ||
            `Failed to fetch available courses: ${res.statusText}`
        );
      }

      const data = await res.json();

      if (data && data.availableCourses) {
        setSelectedCourseTopics(data.availableCourses);
      } else {
        setSelectedCourseTopics([]);
      }

      setIsAvailableCourseModalOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const assignCourse = async (courseId) => {
    if (!selectedUser) return;
    setFormLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/users/${selectedUser._id}/assign-course`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ courseId }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to assign course");
      }

      await fetchUsers();
      setIsAssignCourseModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const addAvailableCourse = async (courseId) => {
    if (!selectedUser || !selectedUser._id || !courseId) {
      setError("Missing user or course ID");
      return;
    }
    setFormLoading(true);
    setError(null);

    try {
      // البحث عن الدورة المحددة للحصول على تفاصيلها
      const course = courses.find((c) => c.id === courseId);

      const payload = {
        courseId,
        allTopicsAvailable,
        availableTopics: allTopicsAvailable
          ? []
          : (course?.topics || [])
              .filter((topic) =>
                selectedCourseTopics.some(
                  (ac) =>
                    ac.course.id === courseId &&
                    ac.availableTopics?.includes(topic.id)
                )
              )
              .map((topic) => topic.id),
      };

      const res = await fetch(
        `/api/admin/users/${selectedUser._id}/available-courses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add available course");
      }

      const data = await res.json();
      setSelectedCourseTopics(data.availableCourses || []);
      setSelectedCourse(null);
      setAllTopicsAvailable(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const removeAvailableCourse = async (courseId) => {
    if (!selectedUser) return;
    setFormLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/users/${selectedUser._id}/available-courses`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ courseId }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to remove available course");
      }

      setSelectedCourseTopics(
        selectedCourseTopics.filter((ac) => ac.course.id !== courseId)
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleTopicSelection = (courseId, topicId, checked) => {
    setSelectedCourseTopics((prev) => {
      const courseIndex = prev.findIndex((ac) => ac.course.id === courseId);
      if (courseIndex === -1) {
        return [
          ...prev,
          {
            course: { id: courseId },
            availableTopics: checked ? [topicId] : [],
            allTopicsAvailable: false,
          },
        ];
      }

      const updatedTopics = checked
        ? [...(prev[courseIndex].availableTopics || []), topicId]
        : (prev[courseIndex].availableTopics || []).filter(
            (id) => id !== topicId
          );

      const updated = [...prev];
      updated[courseIndex] = {
        ...updated[courseIndex],
        availableTopics: updatedTopics,
      };
      return updated;
    });
  };

  const deleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete user");
      }
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage users and their course assignments
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-1"
              onClick={() => {
                setSelectedUser(null);
                setFormData({
                  name: "",
                  email: "",
                  role: "student",
                  temporaryPassword: "",
                });
                setIsEditModalOpen(true);
              }}
            >
              <FiPlus className="ml-2 h-5 w-5" />
              Add User
            </button>
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

        {/* Users Table */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Assigned Courses
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <FiUser className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "instructor"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiBookOpen className="mr-2 h-4 w-4 text-gray-400" />
                            {user.availableCourses?.length || 0} courses
                            {user.availableCourses?.length > 0 && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                {user.availableCourses.reduce(
                                  (total, ac) =>
                                    total +
                                    (ac.allTopicsAvailable
                                      ? ac.course?.topics?.length || 0
                                      : ac.availableTopics?.length || 0),
                                  0
                                )}{" "}
                                topics
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-indigo-600 hover:text-indigo-900 p-2 cursor-pointer rounded-lg hover:bg-indigo-50 transition-colors duration-200"
                              title="Edit User"
                            >
                              <FiEdit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleAssignCourse(user)}
                              className="text-green-600 hover:text-green-900 p-2 cursor-pointer rounded-lg hover:bg-green-50 transition-colors duration-200"
                              title="Assign Course"
                            >
                              <FiBook className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleAvailableCourses(user)}
                              className="text-purple-600 hover:text-purple-900 p-2 cursor-pointer rounded-lg hover:bg-purple-50 transition-colors duration-200"
                              title="Available Courses"
                            >
                              <FiCheck className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => deleteUser(user._id)}
                              className="text-red-600 hover:text-red-900 p-2 cursor-pointer rounded-lg hover:bg-red-50 transition-colors duration-200"
                              title="Delete User"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Create/Edit User Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedUser ? "Edit User" : "Add New User"}
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200 rounded-full p-1 hover:bg-gray-100"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <form
                onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FiUser className="ml-2 h-4 w-4 text-gray-400" />
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FiMail className="ml-2 h-4 w-4 text-gray-400" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FiUsers className="ml-2 h-4 w-4 text-gray-400" />
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FiKey className="ml-2 h-4 w-4 text-gray-400" />
                    {selectedUser
                      ? "New Password (optional)"
                      : "Temporary Password"}
                  </label>
                  <input
                    type="password"
                    name="temporaryPassword"
                    value={formData.temporaryPassword}
                    onChange={handleInputChange}
                    placeholder={
                      selectedUser
                        ? "Leave blank to keep current password"
                        : "Required"
                    }
                    required={!selectedUser}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                  />
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={formLoading}
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="rounded-xl border border-transparent bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                  >
                    {formLoading
                      ? selectedUser
                        ? "Updating..."
                        : "Creating..."
                      : selectedUser
                      ? "Save Changes"
                      : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Course Modal */}
        {isAssignCourseModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  Assign Course to {selectedUser.name}
                </h3>
                <button
                  onClick={() => setIsAssignCourseModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200 rounded-full p-1 hover:bg-gray-100"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {course.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {course.description || "No description available"}
                        </p>
                      </div>
                      <button
                        onClick={() => assignCourse(course.id)}
                        disabled={formLoading}
                        className="ml-4 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-200"
                      >
                        {formLoading ? "Assigning..." : "Assign"}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <FiBook className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      No courses available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Available Courses Modal */}
        {isAvailableCourseModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  Manage Available Courses for {selectedUser.name}
                </h3>
                <button
                  onClick={() => setIsAvailableCourseModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200 rounded-full p-1 hover:bg-gray-100"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Add Available Course Section */}
                <div className="border rounded-xl p-4 bg-gray-50">
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <FiPlus className="ml-2 h-5 w-5 text-indigo-600" />
                    Add Available Course
                  </h4>

                  {selectedCourse ? (
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">
                            {selectedCourse.title}
                          </h5>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedCourse.description || "No description"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200">
                          <input
                            type="checkbox"
                            id="allTopicsAvailable"
                            checked={allTopicsAvailable}
                            onChange={(e) =>
                              setAllTopicsAvailable(e.target.checked)
                            }
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="allTopicsAvailable"
                            className="text-sm font-medium text-gray-700"
                          >
                            Make all topics available
                          </label>
                        </div>

                        {!allTopicsAvailable && (
                          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto border rounded-xl p-3 bg-white">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">
                              Select specific topics:
                            </h5>
                            {selectedCourse.topics?.map((topic, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 py-2 px-2 hover:bg-gray-50 rounded-lg"
                              >
                                <input
                                  type="checkbox"
                                  id={`topic-${index}`}
                                  checked={selectedCourseTopics.some(
                                    (ac) =>
                                      ac.course.id === selectedCourse.id &&
                                      ac.availableTopics?.includes(topic.id)
                                  )}
                                  onChange={(e) =>
                                    handleTopicSelection(
                                      selectedCourse.id,
                                      topic.id,
                                      e.target.checked
                                    )
                                  }
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label
                                  htmlFor={`topic-${index}`}
                                  className="text-sm text-gray-700 flex-1"
                                >
                                  {topic.title}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-end space-x-3 mt-4 pt-3 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCourse(null);
                              setAllTopicsAvailable(false);
                            }}
                            disabled={formLoading}
                            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!selectedCourse?.id) {
                                setError("No valid course selected");
                                return;
                              }
                              addAvailableCourse(selectedCourse.id);
                            }}
                            disabled={formLoading || !selectedCourse?.id}
                            className="rounded-xl border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                          >
                            {formLoading ? "Adding..." : "Add Course"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      {courses
                        .filter(
                          (course) =>
                            !selectedCourseTopics.some(
                              (ac) => ac.course.id === course.id
                            )
                        )
                        .map((course) => (
                          <button
                            key={course.id}
                            onClick={() => {
                              setSelectedCourse(course);
                            }}
                            className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 text-left transition-colors duration-200"
                          >
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-gray-900">
                                {course.title}
                              </h5>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {course.description || "No description"}
                              </p>
                            </div>
                            <FiPlus className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Currently Available Courses Section */}
                <div className="border rounded-xl p-4 bg-gray-50">
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <FiCheck className="ml-2 h-5 w-5 text-green-600" />
                    Currently Available Courses
                  </h4>

                  {selectedCourseTopics.length > 0 ? (
                    <div className="space-y-3 mt-4 max-h-60 overflow-y-auto">
                      {selectedCourseTopics.map((ac, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200"
                        >
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900">
                              {ac.course.title}
                            </h5>
                            <div className="flex items-center space-x-2 mt-1">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  ac.allTopicsAvailable
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {ac.allTopicsAvailable
                                  ? "All Topics Available"
                                  : `${
                                      ac.availableTopics?.length || 0
                                    } Topics Available`}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeAvailableCourse(ac.course.id)}
                            disabled={formLoading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 p-1 rounded-lg hover:bg-red-50 transition-colors duration-200"
                            title="Remove Available Course"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FiBook className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        No available courses assigned
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
