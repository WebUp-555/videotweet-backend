import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPlaylistById, removeVideoFromPlaylist, createPlaylist } from '../api/api';

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const fetchPlaylist = async () => {
    try {
      const response = await getPlaylistById(playlistId);
      setPlaylist(response.data.data);
      if (response.data.data?.videos?.length > 0) {
        setCurrentVideo(response.data.data.videos[0]);
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    if (window.confirm('Remove this video from the playlist?')) {
      try {
        await removeVideoFromPlaylist(videoId, playlistId);
        fetchPlaylist();
      } catch (error) {
        console.error('Error removing video:', error);
      }
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!currentUser?.accessToken) {
      setCreateError('Please log in to create a playlist.');
      return;
    }
    if (!createForm.name.trim() || !createForm.description.trim()) {
      setCreateError('Name and description are required.');
      return;
    }
    try {
      setCreateLoading(true);
      setCreateError('');
      const response = await createPlaylist({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
      });
      const newPlaylist = response.data?.data;
      if (newPlaylist?._id) {
        setIsCreateOpen(false);
        setCreateForm({ name: '', description: '' });
        navigate(`/playlist/${newPlaylist._id}`);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      setCreateError(error.response?.data?.message || 'Failed to create playlist.');
    } finally {
      setCreateLoading(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Playlist</h1>
            <p className="text-gray-400">Manage and watch your playlist</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
          >
            + Create playlist
          </button>
        </div>

        {isCreateOpen && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">New playlist</h2>
                <p className="text-sm text-gray-400">Enter details to create a playlist</p>
              </div>
              <button
                onClick={() => { setIsCreateOpen(false); setCreateError(''); }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="My awesome playlist"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="What is this playlist about?"
                />
              </div>
              {createError && <div className="text-red-400 text-sm">{createError}</div>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold"
                >
                  {createLoading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); setCreateError(''); }}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {playlist ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Video Player */}
            <div className="lg:col-span-2">
              {currentVideo ? (
                <>
                  <div className="bg-black rounded-lg overflow-hidden aspect-video mb-4">
                    <video
                      controls
                      className="w-full h-full"
                      poster={currentVideo.thumbnail}
                      src={currentVideo.videoFile}
                      key={currentVideo._id}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-white mb-4">{currentVideo.title}</h1>
                    <p className="text-gray-300 mb-4">{currentVideo.description}</p>

                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                          {currentVideo.views || 0} views
                        </span>
                        <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                          {new Date(currentVideo.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                  No video selected in this playlist
                </div>
              )}
            </div>

            {/* Sidebar - Playlist Videos */}
            <div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Playlist Videos</h3>
                  <span className="text-sm text-gray-400">{playlist.videos?.length || 0} videos</span>
                </div>

                <div className="space-y-4">
                  {playlist.videos?.length ? (
                    playlist.videos.map((video) => (
                      <div
                        key={video._id}
                        className={`flex gap-3 p-2 rounded-lg cursor-pointer ${
                          currentVideo?._id === video._id ? 'bg-purple-600/20 border border-purple-500/50' : 'hover:bg-gray-700'
                        }`}
                        onClick={() => setCurrentVideo(video)}
                      >
                        <img
                          src={video.thumbnail || 'https://via.placeholder.com/160x90'}
                          alt={video.title}
                          className="w-24 h-16 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">{video.title}</h4>
                          <p className="text-gray-400 text-xs mb-2 line-clamp-2">{video.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{video.views || 0} views</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveVideo(video._id); }}
                              className="text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-6">
                      No videos in this playlist
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 text-center text-gray-300">
            <h2 className="text-2xl font-bold text-white mb-2">Playlist not found</h2>
            <p className="text-gray-400 mb-4">Create a new one to get started.</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
            >
              Create playlist
            </button>
          </div>
        )}

        {playlist ? (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">{playlist.name}</h2>
            <p className="text-gray-400 mb-6">{playlist.description}</p>
            
            {playlist.videos && playlist.videos.length > 0 ? (
              <div className="space-y-4">
                {playlist.videos.map((video) => (
                  <div key={video._id} className="flex gap-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer"
                    onClick={() => setCurrentVideo(video)}>
                    <img
                      src={video.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iOTAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjYWFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VGh1bWJuYWlsPC90ZXh0Pjwvc3ZnPg=='}
                      alt={video.title}
                      className="w-40 h-24 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{video.title}</h4>
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">{video.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{video.views || 0} views</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveVideo(video._id); }}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                No videos in this playlist
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 text-center text-gray-300">
            <h2 className="text-2xl font-bold text-white mb-2">Playlist not found</h2>
            <p className="text-gray-400 mb-4">Create a new one to get started.</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
            >
              Create playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}