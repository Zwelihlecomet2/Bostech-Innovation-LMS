import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';

function AppContent() {
  const { state, createDefaultAdmin } = useApp();
  const [showLanding, setShowLanding] = React.useState(true);

  useEffect(() => {
    createDefaultAdmin();
  }, [createDefaultAdmin]);

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