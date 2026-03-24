import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { changeCurrentPassword } from '../api/api';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const passwordChecks = {
    minLength: formData.newPassword.length >= 6,
    differentFromCurrent:
      formData.oldPassword.length > 0 &&
      formData.newPassword.length > 0 &&
      formData.oldPassword !== formData.newPassword,
    matchesConfirm:
      formData.confirmPassword.length > 0 &&
      formData.newPassword === formData.confirmPassword,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.oldPassword.trim()) {
      setError('Current password is required');
      return;
    }
    if (!formData.newPassword.trim()) {
      setError('New password is required');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (formData.oldPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    try {
      setLoading(true);
      await changeCurrentPassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      setSuccess('Password changed successfully! Redirecting...');
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-lg">
        <section className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/95 shadow-xl">
          <div className="border-b border-gray-800 bg-black/40 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">Account Security</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Change Password</h1>
            <p className="mt-1 text-sm text-gray-400">Update your account password.</p>
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-800/60 bg-red-900/20 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-lg border border-emerald-700/60 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-300">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-200" htmlFor="oldPassword">Current Password</label>
                <input
                  id="oldPassword"
                  type="password"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  className="w-full rounded-lg border border-gray-700 bg-black/60 px-3 py-2.5 text-gray-100 outline-none placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-200" htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full rounded-lg border border-gray-700 bg-black/60 px-3 py-2.5 text-gray-100 outline-none placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
                />
              </div>

              <div className="rounded-lg border border-gray-800 bg-black/50 px-4 py-3">
                <p className={`text-sm ${passwordChecks.minLength ? 'text-emerald-300' : 'text-gray-400'}`}>
                  {passwordChecks.minLength ? '✓' : '•'} At least 6 characters
                </p>
                <p className={`mt-1 text-sm ${passwordChecks.differentFromCurrent ? 'text-emerald-300' : 'text-gray-400'}`}>
                  {passwordChecks.differentFromCurrent ? '✓' : '•'} Different from current password
                </p>
                <p className={`mt-1 text-sm ${passwordChecks.matchesConfirm ? 'text-emerald-300' : 'text-gray-400'}`}>
                  {passwordChecks.matchesConfirm ? '✓' : '•'} Matches confirmation password
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-200" htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full rounded-lg border border-gray-700 bg-black/60 px-3 py-2.5 text-gray-100 outline-none placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>

            <div className="mt-5 text-center">
              <Link to="/dashboard" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

