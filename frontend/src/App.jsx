import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './index.css';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VideoDetail from './pages/VideoDetail';
import UploadVideo from './pages/UploadVideo';
import Dashboard from './pages/Dashboard';
import ChannelPage from './pages/ChannelPage';
import TweetsPage from './pages/TweetsPage';
import PlaylistDetail from './pages/PlaylistDetail';
import EditVideo from './pages/EditVideo';
import ChangePassword from './pages/ChangePassword';
import EditProfile from './pages/EditProfile';
import NotFound from './pages/NotFound';
import Welcome from './pages/Welcome';
import WatchHistory from './pages/WatchHistory';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protected Route Component
function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user');
  
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }
  
  return children;
}

// Auth Route Component (redirect to home if already logged in)
function AuthRoute({ children }) {
  const user = localStorage.getItem('user');
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Navigation Component
function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Read user from localStorage on mount and whenever it changes
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Handle storage changes (e.g., from login/logout in another tab or this tab)
    const handleStorageChange = () => {
      const updatedUserData = localStorage.getItem('user');
      if (updatedUserData) {
        setUser(JSON.parse(updatedUserData));
      } else {
        setUser(null);
      }
    };

    // Handle custom userChanged event for same-tab updates
    const handleUserChanged = () => {
      const updatedUserData = localStorage.getItem('user');
      if (updatedUserData) {
        setUser(JSON.parse(updatedUserData));
      } else {
        setUser(null);
      }
    };

    // Listen for storage changes (other tabs)
    window.addEventListener('storage', handleStorageChange);
    // Listen for custom event (same tab)
    window.addEventListener('userChanged', handleUserChanged);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleUserChanged);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout endpoint if available
      // await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('user');
    setUser(null);
    // Dispatch custom event for navbar update
    window.dispatchEvent(new Event('userChanged'));
    window.location.href = '/login';
  };

  // Hide navigation on login/signup pages
  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/welcome') {
    return null;
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-gray-900/95 backdrop-blur-lg shadow-lg' : 'bg-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white">StreamStack</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link
              to="/tweets"
              className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Tweets
            </Link>
            {user && (
              <Link
                to="/watch-history"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                History
              </Link>
            )}
            {user && (
              <Link
                to="/dashboard"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/upload"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                  </svg>
                  Upload
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <img
                      src={user.avatar || 'https://via.placeholder.com/32'}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      to={`/channel/${user.username}`}
                      className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors rounded-t-lg"
                    >
                      Your Channel
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition-colors rounded-b-lg"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/tweets"
                className="px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Tweets
              </Link>
              {user && (
                <Link
                  to="/watch-history"
                  className="px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Watch History
                </Link>
              )}
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/upload"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Upload Video
                  </Link>
                  <Link
                    to={`/channel/${user.username}`}
                    className="px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Your Channel
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <Routes>
          {/* Welcome/Landing Route */}
          <Route path="/welcome" element={<Welcome />} />
          
          {/* Public Routes */}
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/video/:videoId" element={<ProtectedRoute><VideoDetail /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><UploadVideo /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/channel/:username" element={<ProtectedRoute><ChannelPage /></ProtectedRoute>} />
          <Route path="/tweets" element={<ProtectedRoute><TweetsPage /></ProtectedRoute>} />
          <Route path="/watch-history" element={<ProtectedRoute><WatchHistory /></ProtectedRoute>} />
          <Route path="/playlist/:playlistId" element={<ProtectedRoute><PlaylistDetail /></ProtectedRoute>} />
          <Route path="/edit-video/:videoId" element={<ProtectedRoute><EditVideo /></ProtectedRoute>} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
