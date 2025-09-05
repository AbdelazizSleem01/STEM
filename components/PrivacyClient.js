// app/privacy/page.js
"use client";

import { 
  FaShieldAlt, 
  FaUserLock, 
  FaCookie, 
  FaDatabase,
  FaEye,
  FaRocket,
  FaSignOutAlt,
  FaBook
} from "react-icons/fa";
import Footer from "@/components/Footer";
import Navbar from "./Navbar";
import Link from "next/link";

export default function PrivacyClient({ user }) {

  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 text-gray-900">
      {/* Navigation Bar */}
      <Navbar user={user} />

      {/* Main Content */}
      <main className="pt-24 pb-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl p-8 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <FaShieldAlt className="text-4xl text-indigo-600" />
            <h1 className="text-4xl font-bold text-indigo-700">
              Privacy Policy
            </h1>
          </div>
          
          <p className="text-gray-700 mb-8 p-3 bg-indigo-50 rounded-lg inline-flex items-center">
            <span className="font-semibold text-indigo-700 mr-2">Last Updated:</span> 
            September 05, 2025
          </p>
          
          <div className="space-y-8">
            <section className="p-5 bg-indigo-50 rounded-xl">
              <h2 className="text-xl font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <FaDatabase className="text-indigo-600" />
                1. Information We Collect
              </h2>
              <p className="text-gray-700 pl-8">
                We collect personal information such as your name, email, and
                course progress to provide and improve our services. This includes
                information you provide when creating an account, enrolling in courses,
                or contacting our support team.
              </p>
            </section>
            
            <section className="p-5 bg-indigo-50 rounded-xl">
              <h2 className="text-xl font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <FaEye className="text-indigo-600" />
                2. How We Use Your Data
              </h2>
              <p className="text-gray-700 pl-8">
                Your data is used to personalize your learning experience,
                analyze usage, and ensure platform security. We do not sell your
                information to third parties. We may use aggregated, anonymized data
                for research and improvement of our educational services.
              </p>
            </section>
            
            <section className="p-5 bg-indigo-50 rounded-xl">
              <h2 className="text-xl font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <FaUserLock className="text-indigo-600" />
                3. Data Security
              </h2>
              <p className="text-gray-700 pl-8">
                We implement industry-standard measures to protect your data,
                including encryption, secure servers, and regular security audits.
                However, no online service is 100% secure. You use our platform at
                your own risk, and we recommend using strong, unique passwords.
              </p>
            </section>
            
            <section className="p-5 bg-indigo-50 rounded-xl">
              <h2 className="text-xl font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <FaShieldAlt className="text-indigo-600" />
                4. Your Rights
              </h2>
              <p className="text-gray-700 pl-8">
                You may request access to, correction of, or deletion of your
                personal data by contacting us at support@stemfoundation.com.
                You also have the right to data portability and to withdraw consent
                for data processing where applicable.
              </p>
            </section>
            
            <section className="p-5 bg-indigo-50 rounded-xl">
              <h2 className="text-xl font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <FaCookie className="text-indigo-600" />
                5. Cookies and Tracking
              </h2>
              <p className="text-gray-700 pl-8">
                We use cookies and similar technologies to enhance your experience,
                analyze usage patterns, and deliver personalized content. You can
                manage cookie preferences through your browser settings. Note that
                disabling cookies may affect some functionality of our platform.
              </p>
            </section>
            
            <section className="p-5 bg-indigo-50 rounded-xl">
              <h2 className="text-xl font-semibold text-indigo-800 mb-3">
                6. Changes to This Policy
              </h2>
              <p className="text-gray-700 pl-8">
                We may update this Privacy Policy from time to time. We will notify
                you of any changes by posting the new Privacy Policy on this page and
                updating the &apos;Last Updated&apos; date. You are advised to review this
                Privacy Policy periodically for any changes.
              </p>
            </section>
            
            <section className="p-5 bg-indigo-50 rounded-xl">
              <h2 className="text-xl font-semibold text-indigo-800 mb-3">
                7. Contact Us
              </h2>
              <p className="text-gray-700 pl-8">
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                <span className="font-medium">Email:</span> privacy@stemfoundation.com
                <br />
                <span className="font-medium">Address:</span> 123 Learning Lane, EduCity, EC 12345
              </p>
            </section>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/terms" className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <FaBook className="text-2xl text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-indigo-800 mb-2">Terms of Service</h3>
            <p className="text-gray-600">Read our terms and conditions for using our platform</p>
          </Link>

          <Link href="/contact" className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <FaShieldAlt className="text-2xl text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-indigo-800 mb-2">Contact Us</h3>
            <p className="text-gray-600">Have questions about your privacy? Get in touch</p>
          </Link>

          <Link href="/faq" className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <FaUserLock className="text-2xl text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-indigo-800 mb-2">FAQ</h3>
            <p className="text-gray-600">Find answers to frequently asked questions</p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}