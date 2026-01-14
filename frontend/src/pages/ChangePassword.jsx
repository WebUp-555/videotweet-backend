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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Change Password</h1>
            <p className="text-gray-400">Update your account password</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password (min 6 characters)"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-gray-500 text-xs mt-1">
                Must be at least 6 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <Link
              to="/dashboard"
              className="text-purple-400 hover:text-purple-300 text-sm transition duration-200"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
