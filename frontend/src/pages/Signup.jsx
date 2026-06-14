import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/api';

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

  const avatarInputId = 'avatar-upload-input';
  const coverInputId = 'cover-upload-input';

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
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black px-4 py-12 sm:px-6 sm:py-8">
      <div className="w-full max-w-[448px] rounded-xl border border-gray-800 bg-gray-900 px-6 py-8 shadow-xl sm:px-8 sm:py-10">
        <div className="mb-8 flex w-full flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-semibold text-white">Create your account</h1>
          <p className="text-sm text-gray-400">Sign up to get started</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md border border-red-800/60 bg-red-900/20 px-3 py-2 text-sm font-medium text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center gap-3">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-700 bg-black/60">
              {previews.avatar ? (
                <img src={previews.avatar} alt="Avatar preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl text-gray-500">U</span>
              )}
            </div>

            <input
              id={avatarInputId}
              type="file"
              name="avatar"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <label
              htmlFor={avatarInputId}
              className="cursor-pointer rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm font-medium text-gray-200 transition hover:bg-emerald-900/30 hover:text-emerald-300"
            >
              Upload Photo
            </label>

            <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 5MB</p>

            {previews.avatar && (
              <button
                type="button"
                onClick={() => {
                  setFiles(prev => ({ ...prev, avatar: null }));
                  setPreviews(prev => ({ ...prev, avatar: null }));
                }}
                className="rounded-md border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:bg-emerald-900/30 hover:text-emerald-300"
              >
                Remove Photo
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-200">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-100 outline-none transition placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium text-gray-200">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-100 outline-none transition placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
                placeholder="Choose a username"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-200">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-100 outline-none transition placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-200">
                Password
              </label>
              <div className="flex gap-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-100 outline-none transition placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm font-medium text-gray-200 transition hover:bg-emerald-900/30 hover:text-emerald-300"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-200">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-100 outline-none transition placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
                placeholder="Confirm your password"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor={coverInputId} className="text-sm font-medium text-gray-200">
                Cover Image (Optional)
              </label>
              <input
                id={coverInputId}
                type="file"
                name="coverImage"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full rounded-md border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-200 outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-emerald-700/20 file:px-3 file:py-1.5 file:text-emerald-300 hover:file:bg-emerald-700/30 focus:border-emerald-500"
              />
              {previews.coverImage && (
                <img
                  src={previews.coverImage}
                  alt="Cover preview"
                  className="h-24 w-full rounded-md border border-gray-700 object-cover"
                />
              )}
            </div>
          </div>

          <label htmlFor="terms" className="flex items-start gap-2 text-sm text-gray-400">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-gray-800 accent-emerald-500"
            />
            <span>
              I agree to the <a href="#" className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline">Privacy Policy</a>
            </span>
          </label>

          <div className="space-y-4 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          
        </form>
      </div>

      <p className="pt-6 text-center text-xs text-gray-500">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
