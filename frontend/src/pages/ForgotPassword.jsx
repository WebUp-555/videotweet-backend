import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await forgotPassword({ email });
      if (response.data.success) {
        setSuccess('Email verified successfully. Moving to the next step...');
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 1500);
      } else {
        setError(response.data?.message || 'Failed to verify email. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black px-4 py-12 sm:px-6 sm:py-8">
      <div className="w-full max-w-[448px] rounded-xl border border-gray-800 bg-gray-900 px-6 py-8 shadow-xl sm:px-8 sm:py-10">
        <div className="mb-7 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">Account Recovery</p>
          <h1 className="text-3xl font-semibold text-white">Forgot your password?</h1>
          <p className="text-sm text-gray-400">
            Enter your email address to verify your account before resetting password.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md border border-red-800/60 bg-red-900/20 px-4 py-3 text-sm font-medium text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-200">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
                setSuccess('');
              }}
              className="w-full rounded-md border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-100 outline-none transition placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
              placeholder="your.email@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Verifying email...' : 'Verify email'}
          </button>

          {success && (
            <div className="rounded-md border border-emerald-700/60 bg-emerald-900/20 px-4 py-3 text-sm font-medium text-emerald-300">
              {success}
            </div>
          )}

          <div className="flex w-full items-center gap-3 py-1" aria-hidden="true">
            <div className="h-px flex-1 bg-gray-800" />
            <span className="text-xs text-gray-500">or</span>
            <div className="h-px flex-1 bg-gray-800" />
          </div>

          <Link
            to="/login"
            className="inline-flex h-10 w-full items-center justify-center rounded-md border border-gray-700 bg-gray-900 px-4 text-sm font-semibold text-gray-200 transition hover:bg-emerald-900/30 hover:text-emerald-300"
          >
            Back to login
          </Link>
        </form>
      </div>
    </div>
  );
}

