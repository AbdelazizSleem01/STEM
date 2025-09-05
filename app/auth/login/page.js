"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiMail,
  FiLock,
  FiBook,
  FiUser,
  FiAward,
  FiGlobe,
  FiTarget,
  FiHeart,
} from "react-icons/fi";
import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromPath = params.get("from");
    if (fromPath) {
      const decodedFrom = decodeURIComponent(fromPath);
      setFrom(decodedFrom);
      setError("You must be logged in to access this page");
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      await Swal.fire({
        icon: "success",
        title: "Welcome Back!",
        text: "You have successfully logged in",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      if (res.ok) {
        router.push(data.redirectPath || "/");
        router.refresh(); 
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.message,
        timer: 3000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-full">
              <FiBook className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-indigo-900 mb-2">
            STEM Foundation
          </h1>

          <p className="text-lg text-indigo-700 font-medium mb-4">
            Empowering Future Innovators
          </p>

          <div className="flex justify-center space-x-4 mb-6">
            <FiTarget className="h-6 w-6 text-indigo-500" />
            <FiGlobe className="h-6 w-6 text-indigo-500" />
            <FiAward className="h-6 w-6 text-indigo-500" />
            <FiHeart className="h-6 w-6 text-indigo-500" />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Welcome Back!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full cursor-pointer flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 shadow-md"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FiUser className="mr-2" />
                    Sign in to your account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Section */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2025 STEM Foundation. Empowering the next generation of
            innovators.
          </p>
          <div className="flex justify-center space-x-6 mt-2">
            <span className="text-xs text-gray-400">Science</span>
            <span className="text-xs text-gray-400">Technology</span>
            <span className="text-xs text-gray-400">Engineering</span>
            <span className="text-xs text-gray-400">Mathematics</span>
          </div>
        </div>
      </div>
    </div>
  );
}
