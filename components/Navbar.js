"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  FaSignOutAlt, 
  FaRocket, 
  FaBars, 
  FaTimes,
  FaUser,
  FaTachometerAlt
} from "react-icons/fa";
import Link from "next/link";

export default function Navbar({ user }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        window.location.href = "/auth/login";
      }
    } catch (error) {
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4  shadow-lg fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-20 h-20 relative">
            <Link href="/">
            <Image
              src="/logo.png" 
              alt="STEM Foundation Logo"
              fill
              className="object-contain"
            />
            </Link>
          </div>
          <span className="text-xl font-bold hidden sm:block">STEM Foundation</span>
        </div>

        {/* Desktop Menu - User Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm hidden lg:inline-flex items-center">
                <FaUser className="mr-2" />
                {user.name || user.email}
              </span>
              <div className="w-10 h-10 bg-white text-indigo-600 flex items-center justify-center rounded-full font-medium shadow-md">
                {userInitial}
              </div>
              <a
                href={isAdmin ? "/dashboard/admin/dashboard" : "/dashboard"}
                className="bg-white text-indigo-600 cursor-pointer px-4 py-2 rounded-md hover:bg-gray-100 transition shadow-md flex items-center"
              >
                <FaTachometerAlt className="mr-2" />
                {isAdmin ? "Admin Dashboard" : "Dashboard"}
              </a>
              <button
                onClick={handleLogout}
                className="bg-indigo-800 text-white cursor-pointer px-4 py-2 rounded-md hover:bg-indigo-900 transition shadow-md flex items-center"
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </button>
            </>
          ) : (
            <a
              href="/auth/login"
              className="bg-white text-indigo-600 cursor-pointer px-4 py-2 rounded-md hover:bg-gray-100 transition shadow-md"
            >
              Login
            </a>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2 rounded-md hover:bg-indigo-700 transition"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-indigo-700 mt-4 rounded-lg shadow-lg p-4  mb-5">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-2 bg-indigo-600 rounded-md">
                <div className="w-8 h-8 bg-white text-indigo-600 flex items-center justify-center rounded-full font-medium">
                  {userInitial}
                </div>
                <span className="text-sm truncate">
                  {user.name || user.email}
                </span>
              </div>
              
              <a
                href={isAdmin ? "/dashboard/admin/dashboard" : "/dashboard"}
                className="flex items-center space-x-2 p-3 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaTachometerAlt />
                <span>{isAdmin ? "Admin Dashboard" : "Dashboard"}</span>
              </a>
              
              <a
                href="/profile"
                className="flex items-center space-x-2 p-3 bg-indigo-600 rounded-md hover:bg-indigo-500 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUser />
                <span>Profile</span>
              </a>
              
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 p-3 bg-indigo-800 rounded-md hover:bg-indigo-900 transition"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <a
                href="/auth/login"
                className="block w-full bg-white text-indigo-600 text-center p-3 rounded-md hover:bg-gray-100 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </a>
             
            </div>
          )}
          
          {/* Additional Mobile Navigation Links */}
          <div className="mt-6 pt-4 border-t border-indigo-500">
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/contact"
                className="text-center p-2 bg-indigo-600 rounded-md hover:bg-indigo-500 transition text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact Us
              </a>
              <a
                href="/about-us"
                className="text-center p-2 bg-indigo-600 rounded-md hover:bg-indigo-500 transition text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              <a
                href="/contact"
                className="text-center p-2 bg-indigo-600 rounded-md hover:bg-indigo-500 transition text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
              <a
                href="/terms"
                className="text-center p-2 bg-indigo-600 rounded-md hover:bg-indigo-500 transition text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Terms 
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}