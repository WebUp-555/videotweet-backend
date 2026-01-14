import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChannelStats, getChannelVideos } from '../api/api';

const PLACEHOLDER_THUMB = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90'><rect width='160' height='90' fill='%23222'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23aaa' font-family='Arial' font-size='14'>Video</text></svg>";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, videosResponse] = await Promise.all([
        getChannelStats(),
        getChannelVideos(),
      ]);
      console.log('Stats Response:', statsResponse.data);
      console.log('Videos Response:', videosResponse.data);
      
      setStats(statsResponse.data.data);
      // Extract videos from the response structure
      const videoData = videosResponse.data?.data?.videos || videosResponse.data?.data || [];
      console.log('Extracted videos:', videoData);
      setVideos(Array.isArray(videoData) ? videoData : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Channel Dashboard</h1>
              <p className="text-purple-100">Manage your content and analytics</p>
            </div>
            <Link
              to="/upload"
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              Upload Video
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Total Views</h3>
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalViews?.toLocaleString() || 0}</p>
            <p className="text-green-400 text-sm mt-2">+12.5% from last month</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Subscribers</h3>
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalSubscribers?.toLocaleString() || 0}</p>
            <p className="text-green-400 text-sm mt-2">+8.2% from last month</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Total Videos</h3>
              <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalVideos || videos.length}</p>
            <p className="text-gray-400 text-sm mt-2">Published content</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Total Likes</h3>
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalLikes?.toLocaleString() || 0}</p>
            <p className="text-green-400 text-sm mt-2">+15.3% from last month</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
          <div className="border-b border-gray-700">
            <div className="flex gap-8 px-6">
              {['overview', 'videos', 'analytics', 'comments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 font-medium capitalize transition duration-200 border-b-2 ${
                    activeTab === tab
                      ? 'text-purple-400 border-purple-400'
                      : 'text-gray-400 border-transparent hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-4">Recent Performance</h3>
                  <div className="bg-gray-700/50 rounded-lg p-6">
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                        </svg>
                        <p>Analytics Chart Would Go Here</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link to="/upload" className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 transition duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Upload Video</h4>
                          <p className="text-gray-400 text-sm">Share new content</p>
                        </div>
                      </div>
                    </Link>

                    <button className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 transition duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">View Analytics</h4>
                          <p className="text-gray-400 text-sm">Check performance</p>
                        </div>
                      </div>
                    </button>

                    <button className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 transition duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Manage Comments</h4>
                          <p className="text-gray-400 text-sm">Engage with viewers</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold text-lg">Your Videos</h3>
                  <select className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>All videos</option>
                    <option>Published</option>
                    <option>Drafts</option>
                    <option>Private</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {Array.isArray(videos) && videos.length > 0 ? videos.map((video) => (
                    <div key={video._id} className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition duration-200">
                      <div className="flex gap-4">
                        <img
                          src={video.thumbnail || PLACEHOLDER_THUMB}
                          alt={video.title}
                          className="w-40 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-white font-semibold mb-1">{video.title}</h4>
                              <p className="text-gray-400 text-sm line-clamp-2">{video.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                <span>{video.views || 0} views</span>
                                <span>{video.likes || 0} likes</span>
                                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Link
                                to={`/edit-video/${video._id}`}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition duration-200"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                                </svg>
                              </Link>
                              <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded transition duration-200">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-300">No videos</h3>
                      <p className="mt-1 text-sm text-gray-400">Get started by uploading a new video.</p>
                      <div className="mt-6">
                        <Link
                          to="/upload"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                        >
                          Upload Video
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">Analytics Coming Soon</h3>
                <p className="text-gray-400">Detailed analytics and insights will be available here</p>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">No Comments Yet</h3>
                <p className="text-gray-400">Comments from your videos will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}