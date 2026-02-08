import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { useAuth } from '../hooks/useAuth';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import BookingPage from '../pages/BookingPage';
import GroupsPage from '../pages/GroupsPage';
import PlannerPage from '../pages/PlannerPage';
import AttendancePage from '../pages/AttendancePage';
import MessagesPage from '../pages/MessagesPage';
import NotificationsPage from '../pages/NotificationsPage';
import AdminPage from '../pages/AdminPage';
import { UserRole } from '../types/roles';

// Centralized role gate keeps access rules in one place as the app grows.
const ProtectedRoute: React.FC<{ allowed: UserRole[]; children: React.ReactNode }> = ({
  allowed,
  children,
}) => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-10 text-sm text-slate-500">Loading your workspace...</div>;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { profile } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute allowed={['admin', 'coach', 'player', 'parent']}>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking"
        element={
          <ProtectedRoute allowed={['admin', 'coach', 'player', 'parent']}>
            <AppShell>
              <BookingPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <ProtectedRoute allowed={['admin', 'coach', 'parent']}>
            <AppShell>
              <GroupsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/planner"
        element={
          <ProtectedRoute allowed={['admin', 'coach']}>
            <AppShell>
              <PlannerPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowed={['admin', 'coach', 'parent']}>
            <AppShell>
              <AttendancePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute allowed={['admin', 'coach', 'player', 'parent']}>
            <AppShell>
              <MessagesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowed={['admin', 'coach', 'player', 'parent']}>
            <AppShell>
              <NotificationsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowed={['admin']}>
            <AppShell>
              <AdminPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={profile ? '/' : '/login'} replace />} />
    </Routes>
  );
};

export default App;
