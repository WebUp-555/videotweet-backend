import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-900/30 text-emerald-400">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">Error</p>
        <h1 className="mt-2 text-6xl font-extrabold text-white">404</h1>
        <h2 className="mt-3 text-2xl font-semibold text-white">Page Not Found</h2>
        <p className="mx-auto mt-3 max-w-xl text-gray-400">
          The page you are looking for does not exist or has been moved. Try one of the links below.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-200 transition hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-6">
          <p className="mb-3 text-sm text-gray-400">Popular pages</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/videos" className="rounded-md border border-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800">Videos</Link>
            <Link to="/dashboard" className="rounded-md border border-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800">Dashboard</Link>
            <Link to="/upload" className="rounded-md border border-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800">Upload</Link>
            <Link to="/tweets" className="rounded-md border border-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800">Tweets</Link>
          </div>
        </div>
      </div>
    </div>
  );
}


