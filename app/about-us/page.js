import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import Image from "next/image";
import {
  FaAtom,
  FaHandsHelping,
  FaChalkboardTeacher,
  FaLaptopHouse,
  FaUserTie,
  FaUserGraduate,
  FaFlask,
  FaEnvelope,
  FaPhone,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
} from "react-icons/fa";

export default function AboutUs({user}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>About Us - STEM Foundation</title>
        <meta
          name="description"
          content="Learn about STEM Foundation and our mission to provide quality education"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar user={user} />

      {/* Header Section */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-600 text-white py-16 md:py-32 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="text-5xl md:text-6xl  flex justify-center">
            <Image
              src="/logo.png"
              alt="STEM Foundation Logo"
              width={200}
              height={200}
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            Welcome to STEM Foundation
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            We are a premier educational platform offering high-quality STEM
            courses and learning services. Empower your future with our
            interactive courses, expert-led tutorials, and innovative learning
            tools designed to inspire and educate.
          </p>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
            Why Choose Us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Interactive Learning */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center transition-transform duration-300 hover:transform hover:-translate-y-2">
              <div className="text-blue-600 text-5xl mb-6 flex justify-center">
                <FaHandsHelping />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                Interactive Learning
              </h3>
              <p className="text-gray-600">
                Engage with hands-on projects and real-world applications that
                enhance your understanding of knowledge and skills.
              </p>
            </div>

            {/* Expert Guidance */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center transition-transform duration-300 hover:transform hover:-translate-y-2">
              <div className="text-blue-600 text-5xl mb-6 flex justify-center">
                <FaChalkboardTeacher />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                Expert Guidance
              </h3>
              <p className="text-gray-600">
                Learn from industry leaders and certified educators with
                extensive experience in their respective fields.
              </p>
            </div>

            {/* Flexible Access */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center transition-transform duration-300 hover:transform hover:-translate-y-2">
              <div className="text-blue-600 text-5xl mb-6 flex justify-center">
                <FaLaptopHouse />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                Flexible Access
              </h3>
              <p className="text-gray-600">
                Study at your own pace, anytime, anywhere that suits your
                schedule and learning preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
          <p className="text-lg md:text-xl">
            At STEM Foundation, our mission is to make high-quality education in
            science, technology, engineering, and mathematics accessible to
            everyone. We believe learning should be an enjoyable, immersive
            experience that empowers individuals to reach their full potential
            and contribute to society&apos;s advancement.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
            Our Expert Advisors
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden text-center">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-48 flex items-center justify-center">
                <FaUserTie className="text-white text-6xl" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  Dr. Ahmed Al-Sharif
                </h3>
                <p className="text-gray-600">
                  Expert in Data Science and Artificial Intelligence
                </p>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden text-center">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-48 flex items-center justify-center">
                <FaUserGraduate className="text-white text-6xl" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  Dr. Sara Abdullah
                </h3>
                <p className="text-gray-600">
                  Professor of Electrical and Computer Engineering
                </p>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden text-center">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-48 flex items-center justify-center">
                <FaFlask className="text-white text-6xl" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  Dr. Mohammed Hassan
                </h3>
                <p className="text-gray-600">
                  Biotechnology Researcher and Educator
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-8">
            Get In Touch
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Have questions or want to learn more about our courses? Contact us
            today!
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-6">
            <a
              href="mailto:Youssefmagdy166@gmail.com"
              className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaEnvelope className="mr-2" />
              Email Us
            </a>
            <a
              href="tel:+201125720301"
              className="flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaPhone className="mr-2" />
              Call Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
