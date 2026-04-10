import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/shared/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AssessmentPage from './pages/AssessmentPage';
import FieldAssessmentPage from './pages/FieldAssessmentPage';
import ProfilePage from './pages/ProfilePage';
import ResultsPage from './pages/ResultsPage';
import RoadmapPage from './pages/RoadmapPage';
import ChatbotPage from './pages/ChatbotPage';
import AdminPage from './pages/AdminPage';
import CareersPage from './pages/CareersPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  console.log("USER:", user);
  return user?.is_admin ? children : <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
          <Route path="/assessment" element={<PrivateRoute><Layout><AssessmentPage /></Layout></PrivateRoute>} />
          <Route path="/field-assessment" element={<PrivateRoute><Layout><FieldAssessmentPage /></Layout></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />
          <Route path="/results" element={<PrivateRoute><Layout><ResultsPage /></Layout></PrivateRoute>} />
          <Route path="/roadmap/:careerName" element={<PrivateRoute><Layout><RoadmapPage /></Layout></PrivateRoute>} />
          <Route path="/chatbot" element={<PrivateRoute><Layout><ChatbotPage /></Layout></PrivateRoute>} />
          <Route path="/careers" element={<PrivateRoute><Layout><CareersPage /></Layout></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminRoute><Layout><AdminPage /></Layout></AdminRoute></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
