import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/api';

export default function Login() {
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or username
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError('');
    }, 10000);

    return () => clearTimeout(timer);
  }, [error]);

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
    <div className="flex min-h-screen w-full items-center justify-center bg-black px-4 py-12 sm:px-6 sm:py-8">
      <div className="w-full max-w-[448px] rounded-xl border border-gray-800 bg-gray-900 px-6 py-8 shadow-xl sm:px-8 sm:py-10">
        <div className="mb-8 space-y-1">
          <h1 className="text-3xl font-semibold text-white">Sign in to your account</h1>
          <p className="text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="identifier" className="text-sm font-medium text-gray-200">
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
              className="w-full rounded-md border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-100 outline-none transition placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
              placeholder="Enter your email address"
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
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-100 outline-none transition placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm font-medium text-gray-200 transition hover:bg-emerald-900/30 hover:text-emerald-300"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="flex w-full items-center gap-2 py-1">
            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-600 bg-gray-800 accent-emerald-500" />
            <label htmlFor="remember-me" className="flex-1 text-sm text-gray-300">
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          {error && (
            <div className="rounded-md border border-red-800/60 bg-red-900/20 px-4 py-3">
              <p className="text-sm font-semibold text-red-300">Invalid credentials</p>
              <p className="text-sm text-red-300/90">
                {error}
              </p>
            </div>
          )}

          <p className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
            <span>By signing in you agree to the</span>
            <a href="#" className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline">Terms of Service</a>
            <span>and</span>
            <a href="#" className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline">Privacy Policy</a>
          </p>
        </form>
      </div>
    </div>
  );
}
