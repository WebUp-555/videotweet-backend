import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaylistById, removeVideoFromPlaylist, createPlaylist } from '../api/api';

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
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
      setLoading(true);
      setPageError('');
      const response = await getPlaylistById(playlistId);
      const playlistData = response?.data?.data;
      setPlaylist(playlistData || null);
      if (playlistData?.videos?.length) {
        setCurrentVideo(playlistData.videos[0]);
      } else {
        setCurrentVideo(null);
      }
    } catch (error) {
      setPageError(error.response?.data?.message || 'Failed to fetch playlist details.');
      console.error('Error fetching playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    if (!window.confirm('Remove this video from the playlist?')) return;
    try {
      await removeVideoFromPlaylist(videoId, playlistId);
      await fetchPlaylist();
    } catch (error) {
      console.error('Error removing video:', error);
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
      const newPlaylist = response?.data?.data;
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-700 border-t-emerald-600"></div>
      </div>
    );
  }

  const videos = playlist?.videos || [];

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {playlist?.name || 'Playlist'}
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                {videos.length} {videos.length === 1 ? 'video' : 'videos'} in this playlist
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Create playlist
              </button>
              <button
                onClick={() => navigate('/playlists')}
                className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-gray-800"
              >
                All playlists
              </button>
            </div>
          </div>
          <div className="mt-6 h-px w-full bg-slate-200" />
          {playlist?.description && (
            <p className="mt-4 text-sm leading-6 text-gray-300">{playlist.description}</p>
          )}
        </section>

        {isCreateOpen && (
          <section className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">New playlist</h2>
                <p className="text-sm text-gray-400">Enter details to create another playlist</p>
              </div>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setCreateError('');
                }}
                className="rounded-md border border-gray-700 px-2.5 py-1 text-sm text-gray-400 hover:bg-gray-800"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-200">Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 px-3 py-2 text-gray-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="My awesome playlist"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-200">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 px-3 py-2 text-gray-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  rows="3"
                  placeholder="What is this playlist about?"
                />
              </div>

              {createError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {createError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createLoading}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setCreateError('');
                  }}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {pageError && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {pageError}
          </div>
        )}

        {playlist ? (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              {currentVideo ? (
                <>
                  <div className="overflow-hidden rounded-2xl border border-gray-800 bg-black shadow-sm">
                    {currentVideo.videoFile ? (
                      <video
                        controls
                        className="aspect-video w-full"
                        poster={currentVideo.thumbnail}
                        src={currentVideo.videoFile}
                        key={currentVideo._id}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="flex aspect-video items-center justify-center text-slate-300">
                        Video file not available
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-white">{currentVideo.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-300">
                      {currentVideo.description || 'No description available.'}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span className="rounded-full bg-gray-800 px-3 py-1 text-gray-300">
                        {currentVideo.views || 0} views
                      </span>
                      <span className="rounded-full bg-gray-800 px-3 py-1 text-gray-300">
                        {formatDuration(currentVideo.duration)}
                      </span>
                      <span className="rounded-full bg-gray-800 px-3 py-1 text-gray-300">
                        {currentVideo.createdAt ? new Date(currentVideo.createdAt).toLocaleDateString() : 'Date unavailable'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900 px-6 py-16 text-center text-gray-400">
                  No video selected in this playlist.
                </div>
              )}
            </div>

            <aside className="lg:col-span-4">
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Playlist videos</h3>
                  <span className="text-xs text-gray-400">
                    {videos.length} {videos.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {videos.length ? (
                  <div className="space-y-2">
                    {videos.map((video) => (
                      <button
                        key={video._id}
                        onClick={() => setCurrentVideo(video)}
                        className={`w-full rounded-xl border px-2 py-2 text-left transition ${
                          currentVideo?._id === video._id
                            ? 'border-emerald-300 bg-emerald-50'
                            : 'border-gray-800 hover:bg-gray-950'
                        }`}
                      >
                        <div className="flex gap-3">
                          <img
                            src={video.thumbnail || 'https://via.placeholder.com/160x90'}
                            alt={video.title}
                            className="h-16 w-24 flex-none rounded-lg object-cover"
                          />

                          <div className="min-w-0 grow">
                            <h4 className="line-clamp-2 text-sm font-semibold text-gray-100">
                              {video.title}
                            </h4>
                            <p className="mt-1 line-clamp-1 text-xs text-gray-400">
                              {video.description || 'No description'}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs text-gray-400">{formatDuration(video.duration)}</span>
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveVideo(video._id);
                                }}
                                className="cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                              >
                                Remove
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-700 bg-black px-4 py-10 text-center text-sm text-gray-400">
                    No videos in this playlist.
                  </div>
                )}
              </div>
            </aside>
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900 px-6 py-16 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-white">Playlist not found</h2>
            <p className="mt-2 text-gray-400">Create a new one to get started.</p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Create playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}


