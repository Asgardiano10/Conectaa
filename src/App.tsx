import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts and Pages
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PerformancePage from './pages/PerformancePage';
import TeamPage from './pages/TeamPage';
import AgentPage from './pages/AgentPage';
import NotificationsPage from './pages/NotificationsPage';
import MetaPage from './pages/MetaPage';
import TeamPerformancePage from './pages/TeamPerformancePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bgmain flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/performance" element={<PerformancePage />} />
                <Route path="/team-performance" element={<TeamPerformancePage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/meta" element={<MetaPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/agent/:agentId" element={<AgentPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
