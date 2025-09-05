// app/contact/page.js
"use client";

import { 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaClock,
  FaRocket,
  FaUser,
  FaSignOutAlt,
  FaBook,
  FaPaperPlane
} from "react-icons/fa";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Swal from "sweetalert2";

export default function ContactClient({ user }) {
  const isAdmin = user?.role === "admin";


  const handleSubmit = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: "success",
      title: "Message Sent!",
      text: "Thank you for your message! We'll get back to you soon.",
    });
    e.target.reset();
  };

  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 text-gray-900">
      {/* Navigation Bar */}
       <Navbar user={user} />

      {/* Main Content */}
      <main className="pt-24 pb-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl p-8 mt-8">
          <h1 className="text-4xl font-bold text-indigo-700 mb-6 flex items-center gap-3">
            <FaEnvelope className="text-indigo-600" />
            Contact Us
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            We&apos;d love to hear from you! Reach out to us for support, inquiries, or feedback.
          </p>
          
          <div className="grid md:grid-cols-2 gap-10">
            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-indigo-50 p-5 rounded-xl">
                <h2 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-indigo-600" />
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 flex items-center gap-3">
                    <FaEnvelope className="text-indigo-500" />
                    <span>Youssefmagdy166@gmail.com</span>
                  </p>
                  <p className="text-gray-700 flex items-center gap-3">
                    <FaPhone className="text-indigo-500" />
                    <span>+201125720301</span>
                  </p>
                  <p className="text-gray-700 flex items-start gap-3">
                    <FaMapMarkerAlt className="text-indigo-500 mt-1" />
                    <span>6 October, Cairo, Egypt</span>
                  </p>
                </div>
              </div>
              
              <div className="bg-indigo-50 p-5 rounded-xl">
                <h2 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                  <FaClock className="text-indigo-600" />
                  Business Hours
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-700">Monday - Friday: 9:00 AM - 5:00 PM EEST</p>
                  <p className="text-gray-700">Saturday - Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-md"
              >
                <FaPaperPlane className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <FaEnvelope className="text-2xl text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-indigo-800 mb-2">Email Support</h3>
            <p className="text-gray-600">We typically respond within 24 hours on business days.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <FaPhone className="text-2xl text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-indigo-800 mb-2">Phone Support</h3>
            <p className="text-gray-600">Call us during business hours for immediate assistance.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <FaBook className="text-2xl text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-indigo-800 mb-2">Knowledge Base</h3>
            <p className="text-gray-600">Check our FAQ section for quick answers to common questions.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}