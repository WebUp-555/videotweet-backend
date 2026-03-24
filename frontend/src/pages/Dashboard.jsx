import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getChannelStats,
  getChannelVideos,
  getUserPlaylists,
  createPlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  getChannelComments,
} from '../api/api';

const PLACEHOLDER_THUMB = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90'><rect width='160' height='90' fill='%23cbd5e1'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23475569' font-family='Arial' font-size='14'>Video</text></svg>";

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
        getChannelComments().catch(() => ({ data: { data: [] } })),
      ]);

      setStats(statsResponse.data.data);
      const videoData = videosResponse.data?.data?.videos || videosResponse.data?.data || [];
      setVideos(Array.isArray(videoData) ? videoData : []);

      const commentsData =
        commentsResponse.data?.data?.comments ||
        commentsResponse.data?.data ||
        commentsResponse.data?.comments ||
        [];
      setComments(Array.isArray(commentsData) ? commentsData : []);

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser?._id) {
        try {
          const playlistsResponse = await getUserPlaylists(currentUser._id);
          const playlistsData =
            playlistsResponse.data?.data?.playlists ||
            playlistsResponse.data?.playlists ||
            playlistsResponse.data?.data ||
            [];
          setPlaylists(Array.isArray(playlistsData) ? playlistsData : []);
        } catch {
          setPlaylists([]);
        }
      } else {
        setPlaylists([]);
      }
    } catch {
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

        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser?._id) {
          try {
            const refreshed = await getUserPlaylists(currentUser._id);
            const refreshedData =
              refreshed.data?.data?.playlists ||
              refreshed.data?.playlists ||
              refreshed.data?.data ||
              [];
            setPlaylists(Array.isArray(refreshedData) ? refreshedData : []);
          } catch (err) {
            console.error('Error refreshing playlists:', err);
          }
        }
      } else {
        alert('Playlist created but no data returned');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Failed to create playlist: ${errorMsg}`);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await deletePlaylist(playlistId);
      setPlaylists(playlists.filter((p) => p._id !== playlistId));
    } catch {
      alert('Failed to delete playlist');
    }
  };

  const handleAddVideoToPlaylist = async (videoId, playlistId) => {
    try {
      setAddingToPlaylist({ ...addingToPlaylist, [videoId]: playlistId });
      await addVideoToPlaylist(videoId, playlistId);
      setVideoPlaylistOpen({ ...videoPlaylistOpen, [videoId]: false });
      alert('Video added to playlist!');
    } catch (error) {
      alert(`Failed to add video to playlist: ${error.response?.data?.message || error.message}`);
    } finally {
      setAddingToPlaylist({ ...addingToPlaylist, [videoId]: '' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-700 border-t-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-10">
      <div className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-200">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Channel Dashboard</h1>
              <p className="mt-1 text-sm text-gray-300">Manage your content and analytics</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/change-password"
                className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-gray-800"
              >
                Change Password
              </Link>
              <Link
                to="/upload"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Upload Video
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Views" value={stats?.totalViews?.toLocaleString() || 0} note="+12.5% from last month" />
          <StatCard title="Subscribers" value={stats?.totalSubscribers?.toLocaleString() || 0} note="+8.2% from last month" />
          <StatCard title="Total Videos" value={stats?.totalVideos || videos.length} note="Published content" />
          <StatCard title="Total Likes" value={stats?.totalLikes?.toLocaleString() || 0} note="+15.3% from last month" />
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 shadow-sm">
          <div className="border-b border-gray-800 px-5">
            <div className="flex flex-wrap gap-6">
              {['overview', 'videos', 'playlists', 'analytics', 'comments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 py-3 text-sm font-semibold capitalize transition ${
                    activeTab === tab
                      ? 'border-emerald-600 text-emerald-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-white">Recent Performance</h3>
                  <div className="rounded-xl border border-gray-800 bg-black p-6">
                    <div className="flex h-56 items-center justify-center text-gray-400">
                      <div className="text-center">
                        <p className="text-base font-semibold">Analytics Chart Placeholder</p>
                        <p className="mt-1 text-sm">Performance graph can be added here.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold text-white">Quick Actions</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Link to="/upload" className="rounded-xl border border-gray-800 bg-black p-4 transition hover:bg-gray-800">
                      <h4 className="text-sm font-semibold text-gray-100">Upload Video</h4>
                      <p className="mt-1 text-sm text-gray-400">Share new content</p>
                    </Link>

                    <button onClick={() => setActiveTab('analytics')} className="rounded-xl border border-gray-800 bg-black p-4 text-left transition hover:bg-gray-800">
                      <h4 className="text-sm font-semibold text-gray-100">View Analytics</h4>
                      <p className="mt-1 text-sm text-gray-400">Check performance</p>
                    </button>

                    <button onClick={() => setActiveTab('comments')} className="rounded-xl border border-gray-800 bg-black p-4 text-left transition hover:bg-gray-800">
                      <h4 className="text-sm font-semibold text-gray-100">Manage Comments</h4>
                      <p className="mt-1 text-sm text-gray-400">Engage with viewers</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'playlists' && (
              <div>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">Your Playlists</h3>
                  <button
                    onClick={() => setShowCreatePlaylist(!showCreatePlaylist)}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Create Playlist
                  </button>
                </div>

                {showCreatePlaylist && (
                  <div className="mb-5 rounded-xl border border-gray-800 bg-black p-5">
                    <h4 className="mb-4 text-base font-semibold text-white">Create New Playlist</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-200">Playlist Name</label>
                        <input
                          type="text"
                          value={playlistForm.name}
                          onChange={(e) => setPlaylistForm({ ...playlistForm, name: e.target.value })}
                          placeholder="Enter playlist name"
                          className="w-full rounded-lg border border-gray-700 px-3 py-2.5 text-gray-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-200">Description</label>
                        <textarea
                          value={playlistForm.description}
                          onChange={(e) => setPlaylistForm({ ...playlistForm, description: e.target.value })}
                          placeholder="Enter playlist description (optional)"
                          rows="3"
                          className="w-full rounded-lg border border-gray-700 px-3 py-2.5 text-gray-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setShowCreatePlaylist(false);
                            setPlaylistForm({ name: '', description: '' });
                          }}
                          className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => handleCreatePlaylist(e)}
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          Create Playlist
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {playlists.length > 0 ? (
                    playlists.map((playlist) => (
                      <Link key={playlist._id} to={`/playlist/${playlist._id}`} className="block">
                        <div className="group rounded-xl border border-gray-800 bg-black p-4 transition hover:bg-gray-800">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-gray-100">{playlist.name}</h4>
                              <p className="mt-1 text-sm text-gray-400">{playlist.description || 'No description'}</p>
                              <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                                <span>{playlist.videos?.length || 0} videos</span>
                                <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeletePlaylist(playlist._id);
                                }}
                                className="rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-700 bg-black px-6 py-14 text-center">
                      <h3 className="text-base font-semibold text-gray-100">No playlists yet</h3>
                      <p className="mt-1 text-sm text-gray-400">Get started by creating your first playlist.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">Your Videos</h3>
                  <select className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
                    <option>All videos</option>
                    <option>Published</option>
                    <option>Drafts</option>
                    <option>Private</option>
                  </select>
                </div>

                <div className="space-y-3">
                  {Array.isArray(videos) && videos.length > 0 ? (
                    videos.map((video) => (
                      <div key={video._id} className="rounded-xl border border-gray-800 bg-black p-4">
                        <div className="flex flex-col gap-4 md:flex-row">
                          <img
                            src={video.thumbnail || PLACEHOLDER_THUMB}
                            alt={video.title}
                            className="h-28 w-full rounded-lg object-cover md:h-24 md:w-40 md:flex-none"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="font-semibold text-gray-100">{video.title}</h4>
                                <p className="mt-1 line-clamp-2 text-sm text-gray-400">{video.description}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                                  <span>{video.views || 0} views</span>
                                  <span>{video.likesCount || 0} likes</span>
                                  <span>{video.commentsCount || 0} comments</span>
                                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Link
                                  to={`/edit-video/${video._id}`}
                                  className="rounded-md border border-gray-700 px-2 py-1 text-xs font-semibold text-gray-200 hover:bg-gray-800"
                                >
                                  Edit
                                </Link>

                                <div className="relative">
                                  <button
                                    onClick={() =>
                                      setVideoPlaylistOpen({
                                        ...videoPlaylistOpen,
                                        [video._id]: !videoPlaylistOpen[video._id],
                                      })
                                    }
                                    className="rounded-md border border-gray-700 px-2 py-1 text-xs font-semibold text-gray-200 hover:bg-gray-800"
                                  >
                                    Add to playlist
                                  </button>
                                  {videoPlaylistOpen[video._id] && (
                                    <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg border border-gray-800 bg-gray-900 shadow">
                                      <div className="border-b border-gray-800 px-3 py-2 text-xs font-semibold text-gray-400">Select playlist</div>
                                      <div className="max-h-48 overflow-y-auto">
                                        {Array.isArray(playlists) && playlists.length > 0 ? (
                                          playlists.map((pl) => (
                                            <button
                                              key={pl._id}
                                              onClick={() => handleAddVideoToPlaylist(video._id, pl._id)}
                                              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
                                              disabled={addingToPlaylist[video._id] === pl._id}
                                            >
                                              <span className="truncate">{pl.name || 'Untitled'}</span>
                                              {addingToPlaylist[video._id] === pl._id && (
                                                <svg className="h-4 w-4 animate-spin text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-700 bg-black px-6 py-14 text-center">
                      <h3 className="text-base font-semibold text-gray-100">No videos</h3>
                      <p className="mt-1 text-sm text-gray-400">Get started by uploading a new video.</p>
                      <div className="mt-4">
                        <Link
                          to="/upload"
                          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
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
                <h3 className="mb-4 text-lg font-semibold text-white">Channel Analytics</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <MetricCard label="Total Views" value={stats?.totalViews?.toLocaleString() || 0} />
                  <MetricCard label="Total Likes" value={stats?.totalLikes?.toLocaleString() || 0} />
                  <MetricCard label="Total Videos" value={stats?.totalVideos || 0} />
                  <MetricCard label="Total Subscribers" value={stats?.totalSubscribers || 0} />
                </div>

                <h4 className="mb-3 mt-7 text-base font-semibold text-white">Video Performance</h4>
                <div className="space-y-3">
                  {videos.length > 0 ? (
                    videos.map((video) => (
                      <div key={video._id} className="rounded-lg border border-gray-800 bg-black p-4">
                        <div className="flex items-start gap-3">
                          <img src={video.thumbnail || PLACEHOLDER_THUMB} alt={video.title} className="h-14 w-24 rounded object-cover" />
                          <div>
                            <h5 className="font-semibold text-gray-100">{video.title}</h5>
                            <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-400">
                              <span>{video.views || 0} views</span>
                              <span>{video.likesCount || 0} likes</span>
                              <span>{video.commentsCount || 0} comments</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-700 bg-black px-6 py-10 text-center text-sm text-gray-400">
                      No videos to analyze
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-white">Recent Comments</h3>
                <div className="space-y-3">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment._id} className="rounded-lg border border-gray-800 bg-black p-4">
                        <div className="flex gap-3">
                          <img
                            src={comment.owner?.avatar || 'https://via.placeholder.com/40'}
                            alt={comment.owner?.username}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="20" ry="20" fill="%2394a3b8"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23f8fafc" font-family="Arial" font-size="12">U</text></svg>';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-gray-100">{comment.owner?.fullName || 'Anonymous'}</span>
                              <span className="text-xs text-gray-400">@{comment.owner?.username || 'unknown'}</span>
                            </div>
                            <p className="text-sm text-gray-200">{comment.content}</p>
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
                              <span>On: {comment.video?.title || 'Unknown Video'}</span>
                              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-700 bg-black px-6 py-14 text-center">
                      <h3 className="text-base font-semibold text-gray-100">No Comments Yet</h3>
                      <p className="mt-1 text-sm text-gray-400">Comments from your videos will appear here.</p>
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

function StatCard({ title, value, note }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-xs text-gray-400">{note}</p>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-black p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}


