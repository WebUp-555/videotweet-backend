import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/api';
import './Auth.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [files, setFiles] = useState({
    avatar: null,
    coverImage: null,
  });
  const [previews, setPreviews] = useState({
    avatar: null,
    coverImage: null,
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

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];

    if (file) {
      setFiles(prev => ({ ...prev, [name]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!files.avatar) {
      setError('Avatar is required');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('fullname', formData.fullName);
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('avatar', files.avatar);
      if (files.coverImage) {
        data.append('coverImage', files.coverImage);
      }

      const response = await registerUser(data);
      if (response.data.success) {
        // Show success message and redirect to login
        alert('Account created successfully! Please login.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-backdrop-shape auth-backdrop-shape-left" aria-hidden="true" />
      <div className="auth-backdrop-shape auth-backdrop-shape-right" aria-hidden="true" />

      <section className="auth-shell auth-shell-signup">
        <header className="auth-header">
          <p className="auth-kicker">Create Your Space</p>
          <h1 className="auth-title">Sign Up</h1>
          <p className="auth-subtitle">Fill in your details to create a new account.</p>
        </header>

        <div className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-alert">{error}</div>}

            <div className="auth-grid auth-grid-two">
              <div className="auth-field">
                <label className="auth-label">
                  Avatar <span className="auth-required">*</span>
                </label>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="auth-file-input"
                />
                {previews.avatar && (
                  <div className="auth-preview-card">
                    <img
                      src={previews.avatar}
                      alt="Avatar preview"
                      className="auth-preview-image"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFiles(prev => ({ ...prev, avatar: null }));
                        setPreviews(prev => ({ ...prev, avatar: null }));
                      }}
                      className="auth-secondary-button"
                    >
                      Remove Avatar
                    </button>
                  </div>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-label">Cover Image</label>
                <input
                  type="file"
                  name="coverImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="auth-file-input"
                />
                {previews.coverImage && (
                  <div className="auth-preview-card">
                    <img
                      src={previews.coverImage}
                      alt="Cover preview"
                      className="auth-preview-image"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFiles(prev => ({ ...prev, coverImage: null }));
                        setPreviews(prev => ({ ...prev, coverImage: null }));
                      }}
                      className="auth-secondary-button"
                    >
                      Remove Cover
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="auth-grid auth-grid-two">
              <div className="auth-field">
                <label htmlFor="fullName" className="auth-label">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="John Doe"
                />
              </div>

              <div className="auth-field">
                <label htmlFor="username" className="auth-label">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="johndoe"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="auth-input"
                placeholder="john@example.com"
              />
            </div>

            <div className="auth-grid auth-grid-two">
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

              <div className="auth-field">
                <label htmlFor="confirmPassword" className="auth-label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <label htmlFor="terms" className="auth-check-label">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="auth-checkbox"
              />
              I agree to the{' '}
              <a href="#" className="auth-link">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="auth-link">Privacy Policy</a>
            </label>

            <button type="submit" disabled={loading} className="auth-primary-button">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-link auth-link-strong">
            Sign in
          </Link>
        </p>
      </section>
    </div>
  );
}