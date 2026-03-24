import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWatchHistory } from '../api/api';

export default function WatchHistory() {
  const [watchHistory, setWatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchWatchHistory();
  }, []);

  const fetchWatchHistory = async () => {
    try {
      setLoading(true);
      const response = await getWatchHistory();
      const payload = response?.data?.data;
      const historyData =
        payload?.docs || payload?.history || payload || response?.data?.history || [];
      setWatchHistory(normalizeWatchHistory(historyData));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch watch history');
      console.error('Error fetching watch history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-gray-300">Loading your watch history...</p>
        </div>
      </div>
    );
  }

  const categories = ['all', ...new Set(watchHistory.map((video) => getVideoCategory(video)))];
  const filteredHistory = watchHistory.filter((video) => {
    const watchedDate = getWatchedDate(video);
    if (!isInTimeRange(watchedDate, timeRange)) {
      return false;
    }
    if (category !== 'all' && getVideoCategory(video) !== category) {
      return false;
    }
    return true;
  });

  const grouped = groupHistoryByDay(filteredHistory);
  const totalCount = filteredHistory.length;

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Watch History</h1>
              <p className="mt-1 text-sm text-gray-400">
                {totalCount} {totalCount === 1 ? 'video watched' : 'videos watched'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="all">All time</option>
              </select>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === 'all' ? 'All categories' : item}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (window.confirm('Clear all visible watch history items?')) {
                    setWatchHistory((prev) =>
                      prev.filter(
                        (video) =>
                          !filteredHistory.some((filteredVideo) => filteredVideo._id === video._id)
                      )
                    );
                  }
                }}
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
              >
                Clear history
              </button>
            </div>
          </div>
          <div className="mt-6 h-px w-full bg-slate-200" />
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </div>
        )}

        {totalCount === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900 px-8 py-16">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white">No watch history</h2>
              <p className="mt-2 text-gray-400">
                Videos you watch will appear here. Start exploring to build your history.
              </p>
              <Link
                to="/"
                className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Start watching
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([sectionTitle, videos]) => (
              <section key={sectionTitle} className="rounded-2xl border border-gray-800 bg-gray-900 p-4 shadow-sm">
                <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {sectionTitle}
                </h2>

                <div className="space-y-1">
                  {videos.map((video) => (
                    <article
                      key={video._id}
                      className="group flex flex-col gap-4 rounded-xl px-2 py-3 transition hover:bg-gray-950 md:flex-row"
                    >
                      <Link
                        to={`/video/${video._id}`}
                        className="relative h-44 w-full flex-none overflow-hidden rounded-xl bg-gray-800 md:h-24 md:w-40"
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                        <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-semibold text-white">
                          {formatDuration(video.duration)}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${Math.min(Math.max(video.watchProgress || 100, 2), 100)}%` }}
                          />
                        </div>
                      </Link>

                      <div className="flex min-w-0 grow flex-col gap-2">
                        <Link to={`/video/${video._id}`} className="min-w-0">
                          <h3 className="line-clamp-2 text-base font-semibold text-white">{video.title}</h3>
                        </Link>

                        <div className="flex items-center gap-2">
                          <img
                            src={video.owner?.avatar || 'https://via.placeholder.com/48x48'}
                            alt={video.owner?.username || 'Channel'}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          <span className="text-xs text-gray-400">
                            {video.owner?.fullName || video.owner?.username || 'Unknown creator'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                          <span className="rounded-full bg-gray-800 px-2 py-0.5 text-gray-300">
                            {getVideoCategory(video)}
                          </span>
                          <span>{formatRelativeWatched(getWatchedDate(video))}</span>
                          <span>{formatViews(video.views)} views</span>
                        </div>
                      </div>

                      <div className="flex items-start md:justify-end">
                        <button
                          onClick={() =>
                            setWatchHistory((prev) => prev.filter((historyVideo) => historyVideo._id !== video._id))
                          }
                          className="rounded-lg border border-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function normalizeWatchHistory(historyData) {
  if (!Array.isArray(historyData)) return [];

  return historyData
    .map((item) => {
      if (!item) return null;

      if (typeof item === 'string') {
        return {
          _id: item,
          title: 'Untitled video',
          watchedAt: null,
        };
      }

      // Support wrapped watch-history shape: { video: {...}, watchedAt }
      if (item.video && typeof item.video === 'object') {
        return {
          ...item.video,
          watchedAt: item.watchedAt || item.video.watchedAt || item.video.updatedAt,
        };
      }

      return item;
    })
    .filter((video) => video && typeof video === 'object' && video._id);
}

function getWatchedDate(video) {
  return new Date(video?.watchedAt || video?.updatedAt || video?.createdAt || Date.now());
}

function isInTimeRange(date, timeRange) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (timeRange === 'today') {
    return date.toDateString() === now.toDateString();
  }

  if (timeRange === 'week') {
    return diff <= oneDay * 7;
  }

  if (timeRange === 'month') {
    return diff <= oneDay * 30;
  }

  return true;
}

function getVideoCategory(video) {
  return video?.category?.name || video?.category || 'Uncategorized';
}

function groupHistoryByDay(videos) {
  const groups = { Today: [], Yesterday: [], 'This week': [], Earlier: [] };
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  videos
    .slice()
    .sort((a, b) => getWatchedDate(b).getTime() - getWatchedDate(a).getTime())
    .forEach((video) => {
      const watchedDate = getWatchedDate(video);
      const diff = now.getTime() - watchedDate.getTime();

      if (watchedDate.toDateString() === now.toDateString()) {
        groups.Today.push(video);
      } else if (diff <= oneDay * 2) {
        groups.Yesterday.push(video);
      } else if (diff <= oneDay * 7) {
        groups['This week'].push(video);
      } else {
        groups.Earlier.push(video);
      }
    });

  return Object.fromEntries(Object.entries(groups).filter(([, list]) => list.length > 0));
}

function formatRelativeWatched(date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `Watched ${Math.max(diffMinutes, 1)}m ago`;
  }
  if (diffHours < 24) {
    return `Watched ${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return 'Watched yesterday';
  }
  if (diffDays < 7) {
    return `Watched ${diffDays}d ago`;
  }

  return `Watched on ${date.toLocaleDateString()}`;
}

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatViews(views) {
  if (!views) return '0';
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}


