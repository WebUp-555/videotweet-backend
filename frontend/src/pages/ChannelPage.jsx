import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getUserChannelProfile, toggleSubscription, getUserPlaylists } from '../api/api';

export default function ChannelPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [activeTab, setActiveTab] = useState('videos');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchChannelData();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    setCurrentUser(user);
  }, [username]);

  const fetchChannelData = async () => {
    try {
      const response = await getUserChannelProfile(username);
      const channelData = response.data.data;
      setChannel(channelData);
      setIsSubscribed(channelData?.isSubscribed || false);
      if (channelData?._id) {
        const playlistsResponse = await getUserPlaylists(channelData._id);
        const playlistsData =
          playlistsResponse.data?.data?.playlists ||
          playlistsResponse.data?.playlists ||
          playlistsResponse.data?.data ||
          [];
        setPlaylists(Array.isArray(playlistsData) ? playlistsData : []);
      }
    } catch (error) {
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      const response = await toggleSubscription(channel._id);
      const newSubscribedStatus = response.data?.data?.isSubscribed;
      if (typeof newSubscribedStatus === 'boolean') {
        setIsSubscribed(newSubscribedStatus);
        setChannel((prev) => ({
          ...prev,
          isSubscribed: newSubscribedStatus,
        }));
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-700 border-t-emerald-600"></div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-white">Channel not found</h2>
          <Link to="/" className="mt-3 inline-block text-sm font-semibold text-emerald-400 hover:text-emerald-300">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-10">
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="relative h-40 overflow-hidden rounded-2xl border border-gray-800 bg-black sm:h-48 md:h-56 lg:h-64">
          {channel.coverImage ? (
            <img src={channel.coverImage} alt="Cover" className="h-full w-full object-contain bg-black" />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-emerald-900/40 via-black to-teal-900/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
      </div>

      <div className="mx-auto -mt-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-end">
            <img
              src={channel.avatar || 'https://via.placeholder.com/128'}
              alt={channel.fullName}
              className="h-28 w-28 rounded-full border-4 border-gray-900 object-cover shadow-sm"
            />

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">{channel.fullName}</h1>
              <p className="text-gray-400">@{channel.username}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span>{channel.subscribersCount || 0} subscribers</span>
                <span>{channel.videosCount || 0} videos</span>
                <span>{channel.viewsCount?.toLocaleString() || 0} views</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {currentUser?._id === channel._id && (
                <button
                  onClick={() => navigate('/edit-profile')}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-800"
                >
                  Edit Profile
                </button>
              )}

              <button
                onClick={handleSubscribe}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isSubscribed
                    ? 'border border-gray-700 bg-gray-800 text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
          </div>

          {channel.bio && <p className="mt-5 text-sm leading-6 text-gray-300">{channel.bio}</p>}

          <div className="mt-6 border-b border-gray-800">
            <div className="flex gap-6">
              {['videos', 'playlists', 'about'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-semibold capitalize transition border-b-2 ${
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

          <div className="pt-6">
            {activeTab === 'videos' && (
              <div>
                {channel.videos?.length ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {channel.videos.map((video) => (
                      <Link key={video._id} to={`/video/${video._id}`} className="group rounded-xl border border-gray-800 bg-gray-900 p-2 transition hover:shadow-sm">
                        <div className="relative mb-2 overflow-hidden rounded-lg bg-gray-800 aspect-video">
                          <img src={video.thumbnail || 'https://via.placeholder.com/320x180'} alt={video.title} className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
                          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-semibold text-white">
                            {formatDuration(video.duration)}
                          </div>
                        </div>
                        <h3 className="line-clamp-2 text-sm font-semibold text-gray-100">{video.title}</h3>
                        <div className="mt-1 text-xs text-gray-400">
                          {video.views || 0} views  {new Date(video.createdAt).toLocaleDateString()}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No videos yet" subtitle="This channel has not uploaded any videos." />
                )}
              </div>
            )}

            {activeTab === 'playlists' && (
              <div>
                {playlists.length ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {playlists.map((playlist) => (
                      <Link key={playlist._id} to={`/playlist/${playlist._id}`} className="group rounded-xl border border-gray-800 bg-gray-900 p-2 transition hover:shadow-sm">
                        <div className="relative mb-2 overflow-hidden rounded-lg bg-gray-800 aspect-video">
                          {playlist.videos?.[0]?.thumbnail ? (
                            <img src={playlist.videos[0].thumbnail} alt={playlist.name} className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">No thumbnail</div>
                          )}
                          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-semibold text-white">
                            {playlist.videos?.length || 0} videos
                          </div>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-100">{playlist.name}</h3>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-400">{playlist.description}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No playlists yet" subtitle="This channel has not created any playlists." />
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="max-w-3xl space-y-5 rounded-xl border border-gray-800 bg-black p-5">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-white">Description</h3>
                  <p className="text-sm text-gray-300">{channel.bio || 'This channel has no description yet.'}</p>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold text-white">Stats</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
                      <p className="text-xs text-gray-400">Joined</p>
                      <p className="text-sm font-semibold text-gray-100">{formatJoinedDate(channel.createdAt)}</p>
                    </div>
                    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
                      <p className="text-xs text-gray-400">Total Views</p>
                      <p className="text-sm font-semibold text-gray-100">{channel.viewsCount?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold text-white">Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {channel.socialLinks?.length ? (
                      channel.socialLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:bg-gray-800"
                        >
                          {link.platform}
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No links available</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-700 bg-black px-6 py-16 text-center">
      <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}

function formatDuration(duration) {
  if (!duration) return '0:00';
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatJoinedDate(createdAt) {
  if (!createdAt) return 'Not available';
  try {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) {
      return createdAt;
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return createdAt;
  }
}


