import {
  ArrowRight,
  Shield,
  Users,
  FileText,
  Award,
  Clock,
  CheckCircle,
} from "lucide-react";

interface LandingPageProps {
  onLoginClick: () => void;
}

import bostechLogo from "../assets/bostech-logo.jpg"
export default function LandingPage({ onLoginClick }: LandingPageProps) {
  const handleSSPRegistration = () => {
    // This would typically navigate to an external SSP registration system
    alert(
      "SSP Online Registration - This would redirect to the registration portal"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-amber-600 rounded-lg relative overflow-hidden">
                <Shield className="w-full h-full text-white absolute left-0 top-0" />
                <img
                  src={bostechLogo}
                  alt="Logo"
                  className="absolute left-0 top-0 w-full h-full object-contain pointer-events-none"
                  style={{ zIndex: 2 }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Bostech Training
                </h1>
                <p className="text-sm text-gray-600">
                  Professional Assessment Platform
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              {/* <a
                href="#services"
                className="text-gray-700 hover:text-amber-600 font-medium transition-colors"
              >
                Services
              </a> */}
              <a
                href="#features"
                className="text-gray-700 hover:text-amber-600 font-medium transition-colors"
              >
                Features
              </a>
              {/* <a
                href="#about"
                className="text-gray-700 hover:text-amber-600 font-medium transition-colors"
              >
                About
              </a> */}
              <button
                onClick={onLoginClick}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Login
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Professional
                  <span className="text-amber-600 block">Assessment</span>
                  Platform
                </h1>
                <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                  Secure, reliable, and comprehensive online examination system
                  designed for educational institutions, corporate training, and
                  professional certifications.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex items-center justify-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={onLoginClick}
                  className="flex items-center justify-center space-x-2 border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
                >
                  <span>Login to Dashboard</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">10K+</div>
                  <div className="text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-gray-600">Tests Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">99.9%</div>
                  <div className="text-gray-600">Uptime</div>
                </div>
              </div>
            </div>

            {/* Right Content - Online Services Card */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-white/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-amber-200/40 rounded-full blur-2xl"></div>

              {/* Main Services Card */}
              <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl p-8 shadow-2xl border border-amber-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  ONLINE SERVICES
                </h2>

                <div className="space-y-4">
                  {/* <button className="w-full flex items-center space-x-3 bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <span>SSP ONLINE REGISTRATION</span>
                  </button> */}
                  <button
                    onClick={onLoginClick}
                    className="w-full flex items-center space-x-3 bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                  >
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <span>LOGIN TO YOUR PROFILE</span>
                  </button>
                </div>

                {/* <div className="mt-8 pt-6 border-t border-amber-300">
                  <button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors">
                    DIGITAL MANUALS
                  </button>
                </div> */}
              </div>

              {/* Interior Design Image Placeholder */}
              {/* <div className="absolute -right-0 top-8 w-48 h-32 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl shadow-xl transform -rotate-12">
                <div className="p-4 h-full flex items-center justify-center">
                  <div className="relative flex items-center justify-center w-16 h-16">
                    <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center">
                      <Shield className="w-full h-full text-white" />
                      <img
                        src={bostechLogo}
                        alt="Logo"
                        className="absolute"
                        style={{
                          borderRadius: "50%",
                          width: "60%",
                          height: "60%",
                          objectFit: "contain",
                          left: "20%",
                          top: "20%",
                          zIndex: 2,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Decorative Stripes */}
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-20">
          <div className="space-y-2 transform -rotate-45">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-2 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Bostech Training?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for reliability, security, and ease of use. Our platform
              delivers professional-grade assessment capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure & Reliable",
                description:
                  "Bank-level security with encrypted data transmission and secure user authentication.",
                color: "bg-blue-500",
              },
              {
                icon: Users,
                title: "Admin-Controlled Access",
                description:
                  "Complete control over user registration and access management by administrators.",
                color: "bg-green-500",
              },
              {
                icon: Clock,
                title: "Real-Time Monitoring",
                description:
                  "Live countdown timers with automatic submission to ensure fair assessment.",
                color: "bg-purple-500",
              },
              {
                icon: FileText,
                title: "Instant PDF Reports",
                description:
                  "Generate professional PDF certificates and detailed result reports instantly.",
                color: "bg-amber-500",
              },
              {
                icon: Award,
                title: "Comprehensive Analytics",
                description:
                  "Detailed performance analytics and reporting for both users and administrators.",
                color: "bg-red-500",
              },
              {
                icon: CheckCircle,
                title: "Easy Test Creation",
                description:
                  "Intuitive interface for creating and managing tests with multiple question types.",
                color: "bg-indigo-500",
              },
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
                >
                  <div
                    className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-amber-100 mb-8 leading-relaxed">
            Join thousands of organizations using Bostech Training for their
            assessment needs. Experience the difference of a professional
            examination platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <button
              onClick={handleSSPRegistration}
              className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg"
            >
              Start Registration
            </button> */}
            <button
              onClick={onLoginClick}
              className="relative overflow-hidden border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors group"
            >
              <span
                className="absolute left-0 top-0 h-full w-0 bg-white transition-all duration-300 ease-in group-hover:w-full z-0"
                style={{}}
              />
              <span className="relative z-10 group-hover:text-amber-600 transition-colors duration-300">
                Access Your Account
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg relative overflow-hidden bg-transparent">
                  <Shield className="w-full h-full text-amber-600 absolute left-0 top-0" />
                  <img
                  src={bostechLogo}
                  alt="Bostech Logo"
                  className="absolute left-0 top-0 w-full h-full object-contain pointer-events-none"
                  style={{
                    zIndex: 2,
                    mixBlendMode: "normal",
                  }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Bostech Training</h3>
                  <p className="text-gray-400 text-sm">
                    Professional Assessment Platform
                  </p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Empowering organizations with secure, reliable, and
                comprehensive online examination capabilities since 2025.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Online Testing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    User Management
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Result Analytics
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    PDF Reports
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    System Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 Bostech. All rights reserved. Built with security and
              reliability in mind.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
