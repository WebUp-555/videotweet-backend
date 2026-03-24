import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllVideos } from '../api/api';

const PLACEHOLDER_THUMB = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='320' height='180' fill='%23222'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23aaa' font-family='Arial' font-size='16'>Video</text></svg>";
const PLACEHOLDER_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' rx='20' ry='20' fill='%23333'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23bbb' font-family='Arial' font-size='12'>U</text></svg>";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [durationFilter, setDurationFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('All Recommendations');

  const tabs = [
    'All Recommendations',
    'Gaming',
    'Music',
    'Live',
    'Technology',
    'Design',
    'Podcasts',
    'Recently uploaded',
    'Watched',
  ];

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchVideos();
  }, [filter]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { sortBy: filter } : {};
      const response = await getAllVideos(params);
      
      // Handle paginated response structure
      const videosData = response.data?.data?.docs || response.data?.docs || response.data?.data || [];
      setVideos(Array.isArray(videosData) ? videosData : []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = Array.isArray(videos)
    ? videos.filter((video) => {
        const haystack = `${video.title || ''} ${video.description || ''}`.toLowerCase();
        const matchesSearch = haystack.includes(searchQuery.toLowerCase());

        const matchesTab =
          activeTab === 'All Recommendations' ||
          activeTab === 'Recently uploaded' ||
          activeTab === 'Watched' ||
          haystack.includes(activeTab.toLowerCase());

        const duration = Number(video.duration || 0);
        const matchesDuration =
          durationFilter === 'all' ||
          (durationFilter === 'short' && duration > 0 && duration < 240) ||
          (durationFilter === 'long' && duration >= 1200);

        return matchesSearch && matchesTab && matchesDuration;
      })
    : [];

  return (
    <div className="min-h-screen w-full bg-black">
      <div className="w-full border-b border-gray-800 bg-black px-6 py-3 sm:px-4">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex w-full items-center gap-2">
            <div className="relative w-full">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="search"
                placeholder="Search videos, creators, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                className="rounded-lg border border-gray-700 bg-gray-900 p-2.5 text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300"
                aria-label="Open filters"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 5a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm3 5a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                </svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-gray-800 bg-gray-900 p-2 shadow-lg">
                  <button
                    onClick={() => {
                      setFilter('latest');
                      setShowMenu(false);
                    }}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300"
                  >
                    Sort by Date
                  </button>
                  <button
                    onClick={() => {
                      setFilter('popular');
                      setShowMenu(false);
                    }}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300"
                  >
                    Sort by Popularity
                  </button>
                  <div className="my-1 h-px bg-gray-800" />
                  <button
                    onClick={() => {
                      setDurationFilter('short');
                      setShowMenu(false);
                    }}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300"
                  >
                    Short (Under 4 min)
                  </button>
                  <button
                    onClick={() => {
                      setDurationFilter('long');
                      setShowMenu(false);
                    }}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300"
                  >
                    Long (Over 20 min)
                  </button>
                  <button
                    onClick={() => {
                      setDurationFilter('all');
                      setFilter('all');
                      setShowMenu(false);
                    }}
                    className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm font-medium text-emerald-400 hover:bg-emerald-900/20"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="no-scrollbar mt-3 flex items-center overflow-x-auto">
            <div className="flex min-w-max items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-900 text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-black px-6 py-8 sm:px-4">
        <div className="mx-auto max-w-7xl">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800 rounded-lg aspect-video mb-3"></div>
                <div className="bg-gray-800 h-4 rounded mb-2"></div>
                <div className="bg-gray-800 h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-200 mb-2">No videos found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <Link
                key={video._id}
                to={`/video/${video._id}`}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-md bg-gray-800 aspect-video mb-3">
                  <img
                    src={video.thumbnail || PLACEHOLDER_THUMB}
                    alt={video.title || 'Video thumbnail'}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300"></div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                </div>
                <div className="px-1">
                  <h3 className="text-white font-semibold mb-2 line-clamp-2 transition duration-200 group-hover:text-emerald-400">
                    {video.title || 'Untitled Video'}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={video.owner?.avatar || PLACEHOLDER_AVATAR}
                      alt={video.owner?.username || 'Creator avatar'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <p className="text-gray-300 text-sm hover:text-emerald-300 transition">{video.owner?.username || 'Unknown'}</p>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm gap-2">
                    <span>{video.views || 0} views</span>
                    <span>•</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        </div>
      </div>
    </div>
  );
}

