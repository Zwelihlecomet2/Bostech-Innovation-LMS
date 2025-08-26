import React from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, User, Shield } from 'lucide-react';
import bostechLogo from "../assets/bostech-logo.jpg"

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { state, logout } = useApp();
  const { currentUser } = state;

  if (!currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-amber-600 rounded-lg overflow-hidden">
                <img src={bostechLogo} alt="Bostech Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Bostech Training
                </h1>
                <p className="text-sm text-gray-500">
                  Online Examination System
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  {currentUser.username}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    currentUser.role === "admin"
                      ? "bg-amber-200 text-amber-800"
                      : "bg-orange-200 text-orange-800"
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>

              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

// Card wrapper styles
"bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200"

// Card header styles 
"border-b border-amber-100"

// Stat cards
"bg-gradient-to-br from-amber-50 to-orange-50"