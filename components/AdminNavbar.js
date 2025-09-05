"use client";

import {
  FiUsers,
  FiBook,
  FiMenu,
  FiX,
  FiHome,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "Home", icon: <FiHome className="w-5 h-5" /> },
    {
      href: "/dashboard/admin/users",
      label: "Users",
      icon: <FiUsers className="w-5 h-5" />,
    },
    {
      href: "/dashboard/admin/courses",
      label: "Courses",
      icon: <FiBook className="w-5 h-5" />,
    },
    {
      href: "/dashboard/admin/settings",
      label: "Settings",
      icon: <FiSettings className="w-5 h-5" />,
    },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-md py-2"
            : "bg-gradient-to-r from-indigo-600 to-purple-600 py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo and app name */}
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-white p-1 rounded-lg shadow-sm">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={45}
                    height={45}
                    className="object-contain"
                  />
                </div>
                <span
                  className={`ml-3 text-xl font-bold hidden md:block ${
                    isScrolled ? "text-indigo-700" : "text-white"
                  }`}
                >
                  Admin Dashboard
                </span>
              </div>
            </div>

            {/* Navigation items (for desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isScrolled
                      ? "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center justify-center p-2 rounded-md ${
                  isScrolled
                    ? "text-gray-700 hover:bg-indigo-100"
                    : "text-white hover:bg-white/20"
                }`}
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <FiX className="block h-6 w-6" />
                ) : (
                  <FiMenu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to account for fixed navbar height */}
      <div className="h-16"></div>
    </>
  );
}
