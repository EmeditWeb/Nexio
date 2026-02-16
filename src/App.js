import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import ProfileSetup from './components/ProfileSetup';
import MainLayout from './components/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import HelpCenter from './components/HelpCenter';
import AuthCallback from './components/AuthCallback';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

/** Splash screen while auth loads */
function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-logo">Nexio</div>
      <div className="splash-spinner" />
    </div>
  );
}

/** Redirect logged-in users who haven't set up their profile */
function ProfileGate({ children }) {
  const { currentUser, profile, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (!currentUser) return <Navigate to="/login" />;
  if (!profile) return <Navigate to="/profile-setup" />;
  return children;
}

/** Show splash while loading, redirect if already logged in */
function AuthGate({ children }) {
  const { currentUser, profile, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (currentUser && profile) return <Navigate to="/" />;
  return children;
}

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <div className="app-container">
              <Routes>
                <Route path="/login" element={<AuthGate><LoginForm /></AuthGate>} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route
                  path="/profile-setup"
                  element={<PrivateRoute><ProfileSetup /></PrivateRoute>}
                />
                <Route
                  path="/*"
                  element={
                    <PrivateRoute>
                      <ProfileGate><MainLayout /></ProfileGate>
                    </PrivateRoute>
                  }
                />
              </Routes>
            </div>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
