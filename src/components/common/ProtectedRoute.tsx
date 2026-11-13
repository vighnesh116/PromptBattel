import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: UserRole;
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { currentUser, loading, isDemo } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // In demo mode without explicit login, allow browsing or use default demo role
  if (isDemo && !currentUser) {
    // If not authenticated even in demo, allow passing through for demo review or redirect
    return <>{children}</>;
  }

  if (!currentUser) {
    return <Navigate to={role === 'agent' ? '/agent/login' : '/student/login'} replace />;
  }

  if (role && currentUser.role !== role) {
    return <Navigate to={currentUser.role === 'agent' ? '/agent/dashboard' : '/student/dashboard'} replace />;
  }

  return <>{children}</>;
}

