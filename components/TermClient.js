// app/terms/page.js
"use client";

import { 
  FaFileContract, 
  FaCheckCircle, 
  FaUserCheck, 
  FaBan,
  FaExclamationTriangle,
  FaRocket,
  FaSignOutAlt,
  FaBook,
  FaShieldAlt
} from "react-icons/fa";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Terms({ user }) {
  const isAdmin = user?.role === "admin";
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        window.location.href = "/auth/login";
      }
    } catch (error) {
    }
  };

  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 text-gray-900">
      {/* Navigation Bar */}
      <nav className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaRocket className="text-2xl" />
            <span className="text-xl font-bold">STEM Foundation</span>
          </div>
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden md:inline-flex items-center">
                {user.name || user.email}
              </span>
              <div className="w-10 h-10 bg-white text-indigo-600 flex items-center justify-center rounded-full font-medium shadow-md">
                {userInitial}
              </div>
              <a
                href={isAdmin ? "/dashboard/admin/dashboard" : "/dashboard"}
                className="bg-white text-indigo-600 cursor-pointer px-4 py-2 rounded-md hover:bg-gray-100 transition shadow-md flex items-center"
              >
                {isAdmin ? "Admin Dashboard" : "User Dashboard"}
              </a>
              <button
                onClick={handleLogout}
                className="bg-indigo-800 text-white cursor-pointer px-4 py-2 rounded-md hover:bg-indigo-900 transition shadow-md flex items-center"
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </button>
            </div>
          ) : (
            <a
              href="/auth/login"
              className="bg-white text-indigo-600 cursor-pointer px-4 py-2 rounded-md hover:bg-gray-100 transition shadow-md"
            >
              Login
            </a>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl p-8 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <FaFileContract className="text-4xl text-indigo-600" />
            <h1 className="text-4xl font-bold text-indigo-700">Terms of Service</h1>
          </div>
          
          <p className="text-gray-700 mb-8 p-3 bg-indigo-50 rounded-lg inline-flex items-center">
            <span className="font-semibold text-indigo-700 mr-2">Last Updated:</span> 
            September 05, 2025
          </p>
          
          <div className="space-y-8">
            <section className="p-5 bg-indigo-50 rounded-xl">
              <h2 className="text-xl font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <FaCheckCircle className="text-indigo-600" />
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 pl-8">
                By accessing or using the STEM Foundation platform, you agree to be bound by these Terms of Service. 
                If you do not agree to all the terms and conditions, please do not use our services. These terms apply 
                to all visitors, users, and others who access or use the service.
              </p>
            </section>
            
            <section className="p-5 bg-indigo-50 rounded-xl">
              <h2 className="text-xl font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <FaUserCheck className="text-indigo-600" />
                2. Use of Services
              </h2>
              <p className="text-gray-700 pl-8">
                You may use our courses and resources for personal, non-commercial purposes only. Unauthorized use, 
                reproduction, or distribution is strictly prohibited. You agree not to engage in any activity that 
                interferes with or disrupts the services (or the servers and networks which are connected to the services).
              </p>
            </section>
            
            <section className="p-5 bg-indigo-50 rounded-xl">
              <h2 className="text-xl font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <FaExclamationTriangle className="text-indigo-600" />
                3. User Conduct
              </h2>
              <p className="text-gray-700 pl-8">
                Users must not engage in any activity that disrupts or harms the platform, including but not limited to 
                hacking, spamming, sharing malicious content, or attempting to gain unauthorized access to other users&apos;
                accounts. You are solely responsible for your conduct and any data, text, files, or information that you 
                submit, post, or display on or via the services.
              </p>
            </section>
            
            <section className="p-5 bg-indigo-50 rounded-xl">
              <h2 className="text-xl font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <FaBan className="text-indigo-600" />
                4. Termination
              </h2>
              <p className="text-gray-700 pl-8">
                We reserve the right to terminate or suspend your access to the platform at our discretion if you violate 
                these terms. Upon termination, your right to use the services will immediately cease. If you wish to 
                terminate your account, you may simply discontinue using the services.
              </p>
            </section>
            
            <section className="p-5 bg-indigo-50 rounded-xl">
              <h2 className="text-xl font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <FaFileContract className="text-indigo-600" />
                5. Changes to Terms
              </h2>
              <p className="text-gray-700 pl-8">
                We may update these terms periodically. We will notify you of any changes by posting the new Terms of 
                Service on this page and updating the &apos;Last Updated&apos; date. Continued use of the platform after changes 
                constitutes acceptance of the new terms.
              </p>
            </section>
            
            <section className="p-5 bg-indigo-50 rounded-xl">
              <h2 className="text-xl font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <FaShieldAlt className="text-indigo-600" />
                6. Intellectual Property
              </h2>
              <p className="text-gray-700 pl-8">
                The STEM Foundation platform and its original content, features, and functionality are and will remain 
                the exclusive property of STEM Foundation and its licensors. Our trademarks and trade dress may not be 
                used in connection with any product or service without the prior written consent of STEM Foundation.
              </p>
            </section>
            
            <section className="p-5 bg-indigo-50 rounded-xl">
              <h2 className="text-xl font-semibold text-indigo-800 mb-3">
                7. Governing Law
              </h2>
              <p className="text-gray-700 pl-8">
                These Terms shall be governed and construed in accordance with the laws, without regard to its conflict 
                of law provisions. Our failure to enforce any right or provision of these Terms will not be considered 
                a waiver of those rights.
              </p>
            </section>
            
            <section className="p-5 bg-indigo-50 rounded-xl">
              <h2 className="text-xl font-semibold text-indigo-800 mb-3">
                8. Contact Information
              </h2>
              <p className="text-gray-700 pl-8">
                If you have any questions about these Terms, please contact us at:
                <br />
                <span className="font-medium">Email:</span> legal@stemfoundation.com
                <br />
                <span className="font-medium">Address:</span> 123 Learning Lane, EduCity, EC 12345
              </p>
            </section>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/privacy" className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <FaShieldAlt className="text-2xl text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-indigo-800 mb-2">Privacy Policy</h3>
            <p className="text-gray-600">Learn how we protect and handle your personal information</p>
          </Link>
          <Link href="/contact" className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <FaUserCheck className="text-2xl text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-indigo-800 mb-2">Contact Us</h3>
            <p className="text-gray-600">Have questions about our terms? Get in touch with our team</p>
          </Link>

          <Link href="/faq" className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <FaBook className="text-2xl text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-indigo-800 mb-2">FAQ</h3>
            <p className="text-gray-600">Find answers to frequently asked questions about our services</p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}