import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from './components/ui/toaster';
import Navbar from './components/layout/Navbar';
import DemoBanner from './components/layout/DemoBanner';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const StudentLogin = lazy(() => import('./pages/student/StudentLogin'));
const StudentRegister = lazy(() => import('./pages/student/StudentRegister'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const FindTransport = lazy(() => import('./pages/student/FindTransport'));
const RequestStatus = lazy(() => import('./pages/student/RequestStatus'));
const EmergencyConfirm = lazy(() => import('./pages/student/EmergencyConfirm'));
const EmergencyStatus = lazy(() => import('./pages/student/EmergencyStatus'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));
const EmergencyContacts = lazy(() => import('./pages/student/EmergencyContacts'));

const AgentLogin = lazy(() => import('./pages/agent/AgentLogin'));
const AgentRegister = lazy(() => import('./pages/agent/AgentRegister'));
const AgentDashboard = lazy(() => import('./pages/agent/AgentDashboard'));
const AgentVehicle = lazy(() => import('./pages/agent/AgentVehicle'));
const AgentRequests = lazy(() => import('./pages/agent/AgentRequests'));
const AgentHistory = lazy(() => import('./pages/agent/AgentHistory'));
const AgentLocation = lazy(() => import('./pages/agent/AgentLocation'));

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <LocationProvider>
          <div className="min-h-screen flex flex-col bg-background">
            <DemoBanner />
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
                <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />

                {/* Student auth */}
                <Route path="/student/login" element={<StudentLogin />} />
                <Route path="/student/register" element={<StudentRegister />} />

                {/* Student protected routes */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute role="student">
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/find-transport"
                  element={
                    <ProtectedRoute role="student">
                      <FindTransport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/request/:requestId"
                  element={
                    <ProtectedRoute role="student">
                      <RequestStatus />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/emergency"
                  element={
                    <ProtectedRoute role="student">
                      <EmergencyConfirm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/emergency/status"
                  element={
                    <ProtectedRoute role="student">
                      <EmergencyStatus />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/profile"
                  element={
                    <ProtectedRoute role="student">
                      <StudentProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/emergency-contacts"
                  element={
                    <ProtectedRoute role="student">
                      <EmergencyContacts />
                    </ProtectedRoute>
                  }
                />

                {/* Agent auth */}
                <Route path="/agent/login" element={<AgentLogin />} />
                <Route path="/agent/register" element={<AgentRegister />} />

                {/* Agent protected routes */}
                <Route
                  path="/agent/dashboard"
                  element={
                    <ProtectedRoute role="agent">
                      <AgentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/vehicle"
                  element={
                    <ProtectedRoute role="agent">
                      <AgentVehicle />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/requests"
                  element={
                    <ProtectedRoute role="agent">
                      <AgentRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/history"
                  element={
                    <ProtectedRoute role="agent">
                      <AgentHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent/location"
                  element={
                    <ProtectedRoute role="agent">
                      <AgentLocation />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
          </div>
          <Toaster />
        </LocationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
