import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/api';
import './Auth.css';

export default function Login() {
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or username
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Determine if identifier is email or username
      const isEmail = formData.identifier.includes('@');
      const loginData = {
        [isEmail ? 'email' : 'username']: formData.identifier,
        password: formData.password
      };
      
      const response = await loginUser(loginData);
      if (response.data.success) {
        // Store complete user data with accessToken
        const userData = {
          ...response.data.data.user,
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken
        };
        localStorage.setItem('user', JSON.stringify(userData));
        // Dispatch custom event to update navbar
        window.dispatchEvent(new Event('userChanged'));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-backdrop-shape auth-backdrop-shape-left" aria-hidden="true" />
      <div className="auth-backdrop-shape auth-backdrop-shape-right" aria-hidden="true" />

      <section className="auth-shell auth-shell-login">
        <header className="auth-header">
          <p className="auth-kicker">Welcome Back</p>
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-subtitle">Use your email or username to access your account.</p>
        </header>

        <div className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-alert">{error}</div>}

            <div className="auth-field">
              <label htmlFor="identifier" className="auth-label">
                Email or Username
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                autoComplete="username"
                value={formData.identifier}
                onChange={handleChange}
                className="auth-input"
                placeholder="Email or username"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <div className="auth-inline">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-secondary-button"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="auth-row">
              <label htmlFor="remember-me" className="auth-check-label">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="auth-checkbox"
                />
                Remember me
              </label>

              <Link to="/forgot-password" className="auth-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="auth-primary-button">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="auth-footer-text">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="auth-link auth-link-strong">
            Sign up now
          </Link>
        </p>
      </section>
    </div>
  );
}