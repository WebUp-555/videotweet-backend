import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllVideos } from '../api/api';

const PLACEHOLDER_THUMB = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='320' height='180' fill='%23222'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23aaa' font-family='Arial' font-size='16'>Video</text></svg>";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredVideos = Array.isArray(videos) ? videos.filter(video =>
    video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 animate-fade-in">
              Welcome to Video Platform
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Discover, watch, and share amazing videos from creators around the world
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/upload"
                className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition duration-200 transform hover:scale-105"
              >
                Upload Video
              </Link>
              <Link
                to="/signup"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition duration-200 transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 w-full md:max-w-lg">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-3 pl-12 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'latest', 'popular', 'trending'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-full font-medium transition duration-200 capitalize ${
                    filter === filterOption
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {filterOption}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800 rounded-lg h-48 mb-3"></div>
                <div className="bg-gray-800 h-4 rounded mb-2"></div>
                <div className="bg-gray-800 h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="mx-auto h-24 w-24 text-gray-600 mb-4"
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
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No videos found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <Link
                key={video._id}
                to={`/video/${video._id}`}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-video mb-3 transform transition duration-300 group-hover:scale-105">
                  <img
                    src={video.thumbnail || PLACEHOLDER_THUMB}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition duration-300"></div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                    {video.duration || '10:25'}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="px-1">
                  <h3 className="text-white font-semibold mb-1 line-clamp-2 group-hover:text-purple-400 transition duration-200">
                    {video.title || 'Untitled Video'}
                  </h3>
                  <p className="text-gray-400 text-sm mb-1">{video.owner?.username || 'Unknown'}</p>
                  <div className="flex items-center text-gray-500 text-sm gap-2">
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

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-800 to-pink-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to share your story?</h2>
          <p className="text-gray-200 mb-8 max-w-2xl mx-auto">
            Join thousands of creators and start building your audience today
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition duration-200 transform hover:scale-105"
          >
            Start Creating
          </Link>
        </div>
      </div>
    </div>
  );
}