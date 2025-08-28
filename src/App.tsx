import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';

function AppContent() {
  const { state, loading, error, backendMode } = useApp();
  const [showLanding, setShowLanding] = React.useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {backendMode ? 'Connecting to server...' : 'Loading application...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (showLanding) {
    return <LandingPage onLoginClick={() => setShowLanding(false)} />;
  }

  if (!state.currentUser) {
    return <Login onBackToLanding={() => setShowLanding(true)} />;
  }

  return (
    <Layout>
      {state.currentUser.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;