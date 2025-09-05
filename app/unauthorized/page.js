// app/unauthorized/page.js
import Link from "next/link";
import { FaLock, FaHome, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100 px-4 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 rounded-full">
            <FaLock className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-red-700 mb-4 flex items-center justify-center gap-2">
          <FaExclamationTriangle className="w-7 h-7" />
          Access Denied
        </h1>
        
        {/* Message */}
        <p className="text-gray-600 mb-6 text-lg">
          You don&apos;t have the necessary permissions to access this page. Please contact your administrator if you believe this is an error.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-8">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <FaHome className="w-5 h-5" />
            Go to Dashboard
          </Link>

          <Link
            href="/" 
            className="flex items-center justify-center gap-2 text-indigo-600 px-4 py-3 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
          >
            <FaHome className="w-5 h-5" />
            Return to Homepage
          </Link>
        </div>

        {/* Support Contact */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact support at{" "}
            <Link href="mailto:support@example.com" className="text-indigo-600 hover:underline">
              support@example.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}