import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWatchHistory } from '../api/api';

export default function WatchHistory() {
  const [watchHistory, setWatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWatchHistory();
  }, []);

  const fetchWatchHistory = async () => {
    try {
      setLoading(true);
      const response = await getWatchHistory();
      setWatchHistory(response.data.data || []);
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-pink-500 rounded-full animate-spin"></div>
          <p className="text-gray-300">Loading your watch history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Watch History</h1>
          <p className="text-gray-400">
            {watchHistory.length} {watchHistory.length === 1 ? 'video' : 'videos'}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {watchHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg
              className="w-16 h-16 text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-300 mb-2">No watch history yet</h2>
            <p className="text-gray-400 mb-6">Start watching videos to build your history</p>
            <Link
              to="/"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Explore Videos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {watchHistory.map((video) => (
              <Link
                key={video._id}
                to={`/video/${video._id}`}
                className="group rounded-lg overflow-hidden bg-gray-800 hover:bg-gray-750 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
              >
                {/* Thumbnail */}
                <div className="relative w-full aspect-video bg-gray-700 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-semibold">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-3">
                  {/* Title */}
                  <h3 className="font-semibold text-white line-clamp-2 group-hover:text-purple-400 transition-colors mb-1">
                    {video.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-400 line-clamp-1 mb-2">
                    {video.description}
                  </p>

                  {/* Owner */}
                  {video.owner && (
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={video.owner.avatar}
                        alt={video.owner.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs text-gray-400">
                        {video.owner.username}
                      </span>
                    </div>
                  )}

                  {/* Views and Likes */}
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{formatViews(video.views)} views</span>
                    <span>{formatViews(video.likes)} likes</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to format duration
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

// Helper function to format views
function formatViews(views) {
  if (!views) return '0';
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M';
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  }
  return views.toString();
}
