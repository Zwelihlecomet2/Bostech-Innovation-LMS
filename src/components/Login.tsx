import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import bostechLogo from "../assets/bostech-logo.jpg"

interface LoginProps {
  onBackToLanding?: () => void;
}

export default function Login({ onBackToLanding }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, backendMode } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(username, password);
      if (!loggedInUser) {
        if (backendMode) {
          setError('Invalid credentials. Please check your username and password.');
        } else {
          setError('Invalid credentials. Demo mode - try: admin / admin123');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center space-x-2 text-gray-600 hover:text-amber-700 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        )}
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
                <img
                src={bostechLogo}
                alt="Bostech Logo"
                className="w-16 h-16 rounded-2xl object-cover"
                />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Bostech Training
            </h1>
            <p className="text-gray-600">
              Secure Online Examination System
              {!backendMode && (
                <span className="block text-sm text-amber-600 mt-1">
                  Demo Mode - No Backend Connected
                </span>
              )}
            </p>
        </div>

        {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                placeholder={backendMode ? "Enter your username or email" : "Try: admin"}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                placeholder={backendMode ? "Enter your password" : "Try: admin123"}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-amber-200">
            {backendMode ? (
              <p className="text-xs text-gray-500 text-center">
                Connected to backend server.<br />
                Contact your administrator for access credentials.
              </p>
            ) : (
              <div className="text-xs text-gray-500 text-center">
                <p className="mb-2">
                  <strong>Demo Mode:</strong> Backend not connected
                </p>
                <p>
                  Default credentials: <strong>admin</strong> / <strong>admin123</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}