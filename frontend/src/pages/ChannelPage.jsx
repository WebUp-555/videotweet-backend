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
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, [username]);

  const fetchChannelData = async () => {
    try {
      const response = await getUserChannelProfile(username);
      const channelData = response.data.data;
      setChannel(channelData);
      if (channelData?._id) {
        const playlistsResponse = await getUserPlaylists(channelData._id);
        // Handle nested response structure: data.playlists
        const playlistsData = playlistsResponse.data?.data?.playlists || 
                             playlistsResponse.data?.playlists || 
                             playlistsResponse.data?.data || [];
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
      await toggleSubscription(channel._id);
      setIsSubscribed(!isSubscribed);
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Channel not found</h2>
          <Link to="/" className="text-purple-400 hover:text-purple-300">Go back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-purple-600 to-pink-600">
        {channel.coverImage && (
          <img
            src={channel.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>

      {/* Channel Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 pb-6 border-b border-gray-700">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <img
              src={channel.avatar || 'https://via.placeholder.com/128'}
              alt={channel.fullName}
              className="w-32 h-32 rounded-full border-4 border-gray-900 shadow-xl"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{channel.fullName}</h1>
              <p className="text-gray-400 mb-2">@{channel.username}</p>
              <div className="flex items-center gap-6 text-sm text-gray-300 justify-center md:justify-start">
                <span>{channel.subscribersCount || 0} subscribers</span>
                <span>•</span>
                <span>{channel.videosCount || 0} videos</span>
                <span>•</span>
                <span>{channel.viewsCount?.toLocaleString() || 0} views</span>
              </div>
            </div>
            <div className="flex gap-3">
              {currentUser?._id === channel._id && (
                <button
                  onClick={() => navigate('/edit-profile')}
                  className="px-8 py-3 rounded-full font-semibold bg-purple-600 text-white hover:bg-purple-700 transition duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                  </svg>
                  Edit Profile
                </button>
              )}
              <button
                onClick={handleSubscribe}
                className={`px-8 py-3 rounded-full font-semibold transition duration-200 ${
                  isSubscribed
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Subscribed
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
              <button className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                </svg>
              </button>
            </div>
          </div>

          {channel.bio && (
            <div className="mt-6 text-gray-300">
              <p>{channel.bio}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-700">
          <div className="flex gap-8">
            {['videos', 'playlists', 'about'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-medium capitalize transition duration-200 border-b-2 ${
                  activeTab === tab
                    ? 'text-white border-white'
                    : 'text-gray-400 border-transparent hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === 'videos' && (
            <div>
              {channel.videos && channel.videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {channel.videos.map((video) => (
                    <Link
                      key={video._id}
                      to={`/video/${video._id}`}
                      className="group cursor-pointer"
                    >
                      <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-video mb-3 transform transition duration-300 group-hover:scale-105">
                        <img
                          src={video.thumbnail || 'https://via.placeholder.com/320x180'}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition duration-300"></div>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                          {video.duration || '10:25'}
                        </div>
                      </div>
                      <h3 className="text-white font-semibold mb-1 line-clamp-2 group-hover:text-purple-400 transition duration-200">
                        {video.title}
                      </h3>
                      <div className="flex items-center text-gray-400 text-sm gap-2">
                        <span>{video.views || 0} views</span>
                        <span>•</span>
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <svg className="w-24 h-24 mx-auto mb-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No videos yet</h3>
                  <p className="text-gray-500">This channel hasn't uploaded any videos</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'playlists' && (
            <div>
              {playlists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playlists.map((playlist) => (
                    <Link
                      key={playlist._id}
                      to={`/playlist/${playlist._id}`}
                      className="group cursor-pointer"
                    >
                      <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-video mb-3">
                        {playlist.videos?.[0]?.thumbnail ? (
                          <img
                            src={playlist.videos[0].thumbnail}
                            alt={playlist.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <svg className="w-12 h-12 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-sm px-3 py-1 rounded flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                          </svg>
                          {playlist.videos?.length || 0}
                        </div>
                      </div>
                      <h3 className="text-white font-semibold mb-1 group-hover:text-purple-400 transition duration-200">
                        {playlist.name}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{playlist.description}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <svg className="w-24 h-24 mx-auto mb-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No playlists yet</h3>
                  <p className="text-gray-500">This channel hasn't created any playlists</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-gray-800 rounded-lg p-8 max-w-3xl">
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-semibold text-lg mb-4">Description</h3>
                  <p className="text-gray-300">
                    {channel.bio || 'This channel has no description yet.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-4">Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Joined</p>
                      <p className="text-white font-semibold">
                        {channel.createdAt ? (() => {
                          try {
                            const date = new Date(channel.createdAt);
                            if (isNaN(date.getTime())) {
                              return channel.createdAt;
                            }
                            return date.toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long',
                              day: 'numeric'
                            });
                          } catch (e) {
                            console.error('Date parsing error:', e, 'createdAt:', channel.createdAt);
                            return channel.createdAt;
                          }
                        })() : 'Not available'}
                      </p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Total Views</p>
                      <p className="text-white font-semibold">
                        {channel.viewsCount?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-4">Links</h3>
                  <div className="flex gap-4">
                    {channel.socialLinks?.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition duration-200"
                      >
                        {link.platform}
                      </a>
                    )) || (
                      <p className="text-gray-400">No links available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}