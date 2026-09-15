import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LocationPicker from './components/LocationPicker';

// Pages
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import WalkIns from './pages/WalkIns';
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import SavedJobs from './pages/SavedJobs';
import JobAlerts from './pages/JobAlerts';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route wrappers
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const EmployerRoute = ({ children }) => {
  const { isEmployer, loading } = useAuth();
  if (loading) return null;
  return isEmployer ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Navbar />
            <LocationPicker />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/walk-ins" element={<WalkIns />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/companies/:id" element={<CompanyDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Candidate Routes */}
                <Route
                  path="/saved"
                  element={
                    <ProtectedRoute>
                      <SavedJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/alerts"
                  element={
                    <ProtectedRoute>
                      <JobAlerts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/applications"
                  element={
                    <ProtectedRoute>
                      <Applications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Employer & Admin Routes */}
                <Route
                  path="/employer"
                  element={
                    <EmployerRoute>
                      <EmployerDashboard />
                    </EmployerRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
