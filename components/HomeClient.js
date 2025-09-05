"use client";

import Image from "next/image";
import {
  FaUser,
  FaSignOutAlt,
  FaBook,
  FaUsers,
  FaChalkboardTeacher,
  FaSmile,
  FaHandsHelping,
  FaGraduationCap,
  FaRocket,
} from "react-icons/fa";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function HomeClient({ user }) {
  const isAdmin = user?.role === "admin";

  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 text-gray-900">
      {/* Navigation Bar */}
      <Navbar user={user} />

      {/* Main Content */}
      <main className="pt-24 pb-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden shadow-2xl">
            <Image
              src="/placeholder-image.png"
              alt="STEM Foundation Learning"
              fill
              objectFit="cover"
              className="rounded-lg transform hover:scale-105 transition duration-700"
            />
          </div>

          {/* Text Section */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to STEM Foundation
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              We are a premier educational platform offering high-quality STEM
              courses and learning services. Empower your future with our
              interactive courses, expert-led tutorials, and innovative learning
              tools designed to inspire and educate.
            </p>
            <div className="flex space-x-4">
              <a
                href={
                  user
                    ? isAdmin
                      ? "/dashboard/admin/dashboard"
                      : "/dashboard"
                    : "/auth/login"
                }
                className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition shadow-md"
              >
                <FaBook className="mr-2" /> Explore Courses
              </a>
              <a
                href="/about"
                className="inline-flex items-center bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md hover:bg-indigo-50 transition"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center transform hover:-translate-y-1 transition duration-300">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                <FaBook className="text-2xl text-indigo-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-indigo-600">250+</h3>
            <p className="text-gray-600">Courses Available</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center transform hover:-translate-y-1 transition duration-300">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                <FaUsers className="text-2xl text-indigo-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-indigo-600">10K+</h3>
            <p className="text-gray-600">Active Learners</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center transform hover:-translate-y-1 transition duration-300">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                <FaChalkboardTeacher className="text-2xl text-indigo-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-indigo-600">500+</h3>
            <p className="text-gray-600">Expert Instructors</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center transform hover:-translate-y-1 transition duration-300">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                <FaSmile className="text-2xl text-indigo-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-indigo-600">95%</h3>
            <p className="text-gray-600">Satisfaction Rate</p>
          </div>
        </div>

        {/* Additional Content */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="bg-white p-6 rounded-xl shadow-lg transform hover:-translate-y-1 transition duration-300">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FaHandsHelping className="text-2xl text-indigo-600" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Interactive Learning
              </h3>
              <p className="text-gray-600">
                Engage with hands-on projects and real-world applications.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg transform hover:-translate-y-1 transition duration-300">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FaGraduationCap className="text-2xl text-indigo-600" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Expert Guidance
              </h3>
              <p className="text-gray-600">
                Learn from industry leaders and certified educators.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg transform hover:-translate-y-1 transition duration-300">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FaRocket className="text-2xl text-indigo-600" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Flexible Access
              </h3>
              <p className="text-gray-600">
                Study at your own pace, anytime, anywhere.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
