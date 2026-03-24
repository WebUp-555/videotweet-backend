import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../api/api';

export default function ResetPassword() {
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [formData, setFormData] = useState({
    email: email,
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const passwordChecks = {
    length: formData.password.length >= 8,
    number: /\d/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };
  const passwordScore = Object.values(passwordChecks).filter(Boolean).length;
  const passwordStrength = passwordScore <= 1 ? 'Weak' : passwordScore <= 3 ? 'Medium' : 'Strong';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await resetPassword({
        email: formData.email,
        password: formData.password,
      });
      if (response.data.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black px-4 py-12 sm:px-6 sm:py-8">
      {!success ? (
        <div className="w-full max-w-[448px] rounded-xl border border-gray-800 bg-gray-900 px-6 py-8 shadow-xl sm:px-8 sm:py-10">
          <div className="mb-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">Security</p>
            <h1 className="text-3xl font-semibold text-white">Set new password</h1>
            <p className="text-sm text-gray-400">
              Create a strong password that is different from your previous password.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md border border-red-800/60 bg-red-900/20 px-4 py-3 text-sm font-medium text-red-300">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-200">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-100 outline-none transition placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-200">New password</label>
              <div className="flex gap-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-100 outline-none transition placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
                  placeholder="Enter new password"
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

            <div className="space-y-1">
              <div className="grid grid-cols-4 gap-1.5" role="presentation">
                <span className={`h-1.5 rounded-full ${passwordScore >= 1 ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                <span className={`h-1.5 rounded-full ${passwordScore >= 2 ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                <span className={`h-1.5 rounded-full ${passwordScore >= 3 ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                <span className={`h-1.5 rounded-full ${passwordScore >= 4 ? 'bg-emerald-500' : 'bg-gray-700'}`} />
              </div>
              <p className={`text-xs font-semibold ${passwordScore >= 4 ? 'text-emerald-300' : passwordScore >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                {passwordStrength}
              </p>
            </div>

            <div className="rounded-lg border border-gray-800 bg-black/50 px-4 py-3">
              <p className={`text-sm ${passwordChecks.length ? 'text-emerald-300' : 'text-gray-400'}`}>
                {passwordChecks.length ? '✓' : '•'} At least 8 characters
              </p>
              <p className={`mt-1 text-sm ${passwordChecks.number ? 'text-emerald-300' : 'text-gray-400'}`}>
                {passwordChecks.number ? '✓' : '•'} Contains at least 1 number
              </p>
              <p className={`mt-1 text-sm ${passwordChecks.lowercase ? 'text-emerald-300' : 'text-gray-400'}`}>
                {passwordChecks.lowercase ? '✓' : '•'} Contains at least 1 lowercase letter
              </p>
              <p className={`mt-1 text-sm ${passwordChecks.special ? 'text-emerald-300' : 'text-gray-400'}`}>
                {passwordChecks.special ? '✓' : '•'} Contains at least 1 special character
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-200">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-100 outline-none transition placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Updating password...' : 'Reset password'}
            </button>

            <Link
              to="/login"
              className="inline-flex h-10 w-full items-center justify-center rounded-md border border-gray-700 bg-gray-900 px-4 text-sm font-semibold text-gray-200 transition hover:bg-emerald-900/30 hover:text-emerald-300"
            >
              Back to login
            </Link>
          </form>
        </div>
      ) : (
        <div className="w-full max-w-[448px] rounded-xl border border-gray-800 bg-gray-900 px-6 py-8 text-center shadow-xl sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">All Set</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Password reset</h1>
          <p className="mt-2 text-sm text-gray-300">{success}</p>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-6 h-10 w-full rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Continue to login
          </button>
        </div>
      )}
    </div>
  );
}

