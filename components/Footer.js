import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 w-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="STEM Foundation Logo"
                width={70}
                height={70}
              />{" "}
              <span className="text-xl font-bold">STEM Foundation</span>
            </div>
            <p className="mt-2 text-gray-400">
              Empowering futures through education
            </p>
          </div>

          <div className="flex space-x-6">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaFacebook className="text-2xl" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTwitter className="text-2xl" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaLinkedin className="text-2xl" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaInstagram className="text-2xl" />
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} STEM Foundation. All rights
            reserved.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto text-center">
      
        <div className="mt-2 space-x-4">
          <Link href="/terms" className="hover:text-indigo-300">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-indigo-300">
            Privacy
          </Link>
          <Link href="/contact" className="hover:text-indigo-300">
            Contact Us
          </Link>
          <Link href="/about-us" className="hover:text-indigo-300">
            About Us
          </Link>
        </div>
      </div>
    </footer>
  );
}
