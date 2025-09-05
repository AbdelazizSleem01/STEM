// app/not-found.js
import Image from "next/image";
import Link from "next/link";
import { FaHome, FaRedo, FaExclamationTriangle } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center bg-white px-4 pb-4">
      <div className="text-center max-w-lg mx-auto">
        {/* Logo */}
        <div className="">
          <Image
            src="/logo.png" 
            alt="Website Logo"
            width={120}
            height={120}
            className="mx-auto"
          />
        </div>

        {/* 404 Title */}
        <h1 className="text-9xl font-black text-indigo-600 mb-2">404</h1>

        {/* Error Message */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-8 text-lg">
          The page you&apos;re looking for doesn&apos;t exist. You may have mistyped the address or the page might have moved.
        </p>

        {/* Illustration */}
        <div className="my-8">
          <Image
            src="/notfound.png" 
            alt="Page not found illustration"
            width={400}
            height={300}
            className="mx-auto"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            href="/"
            className="px-6 py-3 bg-indigo-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <FaHome className="w-5 h-5" />
            Go Home
          </Link>
          
        </div>
      </div>
    </div>
  );
}