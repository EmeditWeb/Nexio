import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginForm from './components/LoginForm';
import ProfileSetup from './components/ProfileSetup';
import MainLayout from './components/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import HelpCenter from './components/HelpCenter';
import AuthCallback from './components/AuthCallback';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import './App.css';

/** Redirect logged-in users who haven't set up their profile */
function ProfileGate({ children }) {
  const { currentUser, profile } = useAuth();

  if (!currentUser) return <Navigate to="/login" />;
  if (!profile) return <Navigate to="/profile-setup" />;
  return children;
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/profile-setup"
              element={
                <PrivateRoute>
                  <ProfileSetup />
                </PrivateRoute>
              }
            />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <ProfileGate>
                    <MainLayout />
                  </ProfileGate>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
