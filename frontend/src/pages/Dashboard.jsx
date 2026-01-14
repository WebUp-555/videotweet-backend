import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChannelStats, getChannelVideos, getUserPlaylists, createPlaylist, deletePlaylist, addVideoToPlaylist, getChannelComments } from '../api/api';

const PLACEHOLDER_THUMB = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90'><rect width='160' height='90' fill='%23222'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23aaa' font-family='Arial' font-size='14'>Video</text></svg>";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [playlistForm, setPlaylistForm] = useState({ name: '', description: '' });
  const [videoPlaylistOpen, setVideoPlaylistOpen] = useState({});
  const [addingToPlaylist, setAddingToPlaylist] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, videosResponse, commentsResponse] = await Promise.all([
        getChannelStats(),
        getChannelVideos(),
        getChannelComments().catch(() => ({ data: { data: [] } })), // Fallback if endpoint doesn't exist yet
      ]);
      
      setStats(statsResponse.data.data);
      // Extract videos from the response structure
      const videoData = videosResponse.data?.data?.videos || videosResponse.data?.data || [];
      setVideos(Array.isArray(videoData) ? videoData : []);
      
      // Extract comments from the response structure
      const commentsData = commentsResponse.data?.data?.comments || 
                          commentsResponse.data?.data || 
                          commentsResponse.data?.comments || [];
      setComments(Array.isArray(commentsData) ? commentsData : []);
      
      // Load user playlists - get current user first
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser?._id) {
        try {
          const playlistsResponse = await getUserPlaylists(currentUser._id);
          
          // Handle the nested response structure: data.playlists
          const playlistsData = playlistsResponse.data?.data?.playlists || 
                               playlistsResponse.data?.playlists || 
                               playlistsResponse.data?.data || [];
          setPlaylists(Array.isArray(playlistsData) ? playlistsData : []);
        } catch (playlistError) {
          setPlaylists([]);
        }
      } else {
        setPlaylists([]);
      }
    } catch (error) {
      setVideos([]);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    if (e) e.preventDefault();
    if (!playlistForm.name.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    try {
      const response = await createPlaylist({
        name: playlistForm.name,
        description: playlistForm.description,
      });
      const newPlaylist = response.data?.data;
      if (newPlaylist) {
        setPlaylists([...playlists, newPlaylist]);
        setPlaylistForm({ name: '', description: '' });
        setShowCreatePlaylist(false);
        alert('Playlist created successfully!');
        // Refresh playlists from backend
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser?._id) {
          try {
            const refreshed = await getUserPlaylists(currentUser._id);
            // Handle the nested response structure
            const refreshedData = refreshed.data?.data?.playlists || 
                                 refreshed.data?.playlists || 
                                 refreshed.data?.data || [];
            console.log('Refreshed playlists:', refreshedData);
            setPlaylists(Array.isArray(refreshedData) ? refreshedData : []);
          } catch (err) {
            console.error('Error refreshing playlists:', err);
          }
        }
      } else {
        console.warn('No playlist data in response');
        alert('Playlist created but no data returned');
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to create playlist: ' + errorMsg);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await deletePlaylist(playlistId);
      setPlaylists(playlists.filter(p => p._id !== playlistId));
    } catch (error) {
      console.error('Error deleting playlist:', error);
      alert('Failed to delete playlist');
    }
  };

  const handleAddVideoToPlaylist = async (videoId, playlistId) => {
    try {
      setAddingToPlaylist({...addingToPlaylist, [videoId]: playlistId});
      await addVideoToPlaylist(videoId, playlistId);
      setVideoPlaylistOpen({...videoPlaylistOpen, [videoId]: false});
      alert('Video added to playlist!');
    } catch (error) {
      console.error('Error adding video to playlist:', error);
      alert('Failed to add video to playlist: ' + (error.response?.data?.message || error.message));
    } finally {
      setAddingToPlaylist({...addingToPlaylist, [videoId]: ''});
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
            <div className="flex gap-3">
              <Link
                to="/change-password"
                className="bg-white/20 text-white px-4 py-3 rounded-lg font-semibold hover:bg-white/30 transition duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Change Password
              </Link>
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
              {['overview', 'videos', 'playlists', 'analytics', 'comments'].map((tab) => (
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

                    <button 
                      onClick={() => setActiveTab('analytics')}
                      className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 transition duration-200">
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

                    <button 
                      onClick={() => setActiveTab('comments')}
                      className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 transition duration-200">
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

            {activeTab === 'playlists' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold text-lg">Your Playlists</h3>
                  <button
                    onClick={() => setShowCreatePlaylist(!showCreatePlaylist)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    Create Playlist
                  </button>
                </div>

                {showCreatePlaylist && (
                  <div className="bg-gray-700/50 rounded-lg p-6 mb-6 border border-gray-600">
                    <h4 className="text-white font-semibold mb-4">Create New Playlist</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Playlist Name</label>
                        <input
                          type="text"
                          value={playlistForm.name}
                          onChange={(e) => setPlaylistForm({...playlistForm, name: e.target.value})}
                          placeholder="Enter playlist name"
                          className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                          value={playlistForm.description}
                          onChange={(e) => setPlaylistForm({...playlistForm, description: e.target.value})}
                          placeholder="Enter playlist description (optional)"
                          rows="3"
                          className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => {
                            setShowCreatePlaylist(false);
                            setPlaylistForm({ name: '', description: '' });
                          }}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => handleCreatePlaylist(e)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200 font-medium"
                        >
                          Create Playlist
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {playlists.length > 0 ? (
                    playlists.map((playlist) => (
                      <Link key={playlist._id} to={`/playlist/${playlist._id}`} className="block">
                        <div className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition duration-200 cursor-pointer group">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-white font-semibold mb-1 group-hover:text-purple-400 transition">{playlist.name}</h4>
                              <p className="text-gray-400 text-sm mb-2">{playlist.description || 'No description'}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>{playlist.videos?.length || 0} videos</span>
                                <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition duration-200">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                                </svg>
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeletePlaylist(playlist._id);
                                }}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded transition duration-200"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-300">No playlists yet</h3>
                      <p className="mt-1 text-sm text-gray-400">Get started by creating your first playlist.</p>
                      {!showCreatePlaylist && (
                        <div className="mt-6">
                          <button
                            onClick={() => setShowCreatePlaylist(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 gap-2"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                            </svg>
                            Create Playlist
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
                              <div className="relative">
                                <button 
                                  onClick={() => setVideoPlaylistOpen({...videoPlaylistOpen, [video._id]: !videoPlaylistOpen[video._id]})}
                                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition duration-200"
                                  title="Add to playlist"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M4 3a1 1 0 00-1 1v12a1 1 0 001.555.832L10 13.202l5.445 3.63A1 1 0 0017 16V4a1 1 0 00-1-1H4z" />
                                  </svg>
                                </button>
                                {videoPlaylistOpen[video._id] && (
                                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                                    <div className="px-3 py-2 border-b border-gray-700 text-sm text-gray-300">Add to playlist</div>
                                    <div className="max-h-48 overflow-y-auto">
                                      {Array.isArray(playlists) && playlists.length > 0 ? (
                                        playlists.map((pl) => (
                                          <button
                                            key={pl._id}
                                            onClick={() => handleAddVideoToPlaylist(video._id, pl._id)}
                                            className="w-full text-left px-3 py-2 text-gray-200 hover:bg-gray-700 text-sm flex items-center justify-between"
                                            disabled={addingToPlaylist[video._id] === pl._id}
                                          >
                                            <span className="truncate">{pl.name || 'Untitled'}</span>
                                            {addingToPlaylist[video._id] === pl._id && (
                                              <svg className="w-4 h-4 animate-spin text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" opacity="0.25" />
                                                <path d="M22 12a10 10 0 00-10-10" />
                                              </svg>
                                            )}
                                          </button>
                                        ))
                                      ) : (
                                        <div className="px-3 py-3 text-sm text-gray-400">No playlists yet</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
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
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">Channel Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <p className="text-gray-400 text-sm mb-2">Total Views</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalViews?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <p className="text-gray-400 text-sm mb-2">Total Likes</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalLikes?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <p className="text-gray-400 text-sm mb-2">Total Videos</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalVideos || 0}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <p className="text-gray-400 text-sm mb-2">Total Subscribers</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalSubscribers || 0}</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mt-8 mb-4">Video Performance</h3>
                <div className="space-y-4">
                  {videos.length > 0 ? (
                    videos.map((video) => (
                      <div key={video._id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                        <div className="flex gap-4">
                          <img src={video.thumbnail} alt={video.title} className="w-24 h-14 rounded object-cover" />
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1">{video.title}</h4>
                            <div className="flex gap-4 text-sm text-gray-400">
                              <span>{video.views || 0} views</span>
                              <span>{video.likes || 0} likes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">No videos to analyze</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">Recent Comments</h3>
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment._id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                        <div className="flex gap-3">
                          <img
                            src={comment.owner?.avatar || 'https://via.placeholder.com/40'}
                            alt={comment.owner?.username}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="20" ry="20" fill="%23333"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23bbb" font-family="Arial" font-size="12">U</text></svg>';
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-semibold">{comment.owner?.fullName || 'Anonymous'}</span>
                              <span className="text-gray-400 text-sm">@{comment.owner?.username || 'unknown'}</span>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{comment.content}</p>
                            <div className="flex gap-4 text-xs text-gray-400">
                              <span>On: {comment.video?.title || 'Unknown Video'}</span>
                              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}