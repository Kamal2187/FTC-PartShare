import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { PartsProvider } from './contexts/PartsContext';
import AuthPage from './components/Auth/AuthPage';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import Marketplace from './components/Marketplace/Marketplace';
import PublicMarketplace from './components/Marketplace/PublicMarketplace';
import Profile from './components/Profile/Profile';
import Messages from './components/Messages/Messages';
import Onboarding from './components/Onboarding/Onboarding';
import PartsUpdateAdmin from './components/Admin/PartsUpdateAdmin';

type Page = 'dashboard' | 'marketplace' | 'profile' | 'messages' | 'admin';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <>{children}</> : null;
}

function PublicLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Robotics Marketplace</h1>
          <button
            onClick={() => navigate('/auth')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <PublicMarketplace />
      </main>
    </div>
  );
}

function AuthenticatedLayout() {
  const { user, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !user.hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [user]);

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="messages" element={<Messages />} />
          <Route path="admin" element={<PartsUpdateAdmin />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <PartsProvider>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<PublicLayout />} />
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <AuthenticatedLayout />
                  </PrivateRoute>
                }
              />
            </Routes>
          </PartsProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;