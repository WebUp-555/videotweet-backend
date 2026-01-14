import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Inline placeholders to avoid external DNS failures
const PLACEHOLDER_RELATED = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90'><rect width='160' height='90' fill='%23222'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23aaa' font-family='Arial' font-size='14'>Video</text></svg>";
const PLACEHOLDER_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' rx='20' ry='20' fill='%23333'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23bbb' font-family='Arial' font-size='12'>U</text></svg>";
import { 
  getVideoById, 
  toggleVideoLike, 
  getVideoComments, 
  addComment,
  deleteComment,
  toggleSubscription,
  getUserPlaylists,
  addVideoToPlaylist
} from '../api/api';

export default function VideoDetail() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [addingPlaylistId, setAddingPlaylistId] = useState('');
  const [playlistMessage, setPlaylistMessage] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchVideo();
    fetchComments();
  }, [videoId]);

  useEffect(() => {
    if (currentUser?._id) {
      loadPlaylists();
    }
  }, [currentUser?._id]);

  const fetchVideo = async () => {
    try {
      const response = await getVideoById(videoId);
      setVideo(response.data.data);
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await getVideoComments(videoId);
      const commentsData = response.data?.data || [];
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const loadPlaylists = async () => {
    try {
      const response = await getUserPlaylists(currentUser._id);
      const data = response.data?.data || [];
      setPlaylists(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setPlaylists([]);
    }
  };

  const handleLike = async () => {
    try {
      await toggleVideoLike(videoId);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!currentUser?.accessToken) {
      return;
    }
    if (currentUser?._id && video?.owner?._id && currentUser._id === video.owner._id) {
      // Prevent self-subscription
      return;
    }
    try {
      await toggleSubscription(video.owner._id);
      setIsSubscribed(!isSubscribed);
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!currentUser?.accessToken) {
      setPlaylistMessage('Please log in to add to a playlist.');
      return;
    }
    if (!playlistId || !video?._id) return;
    try {
      setAddingPlaylistId(playlistId);
      setPlaylistMessage('');
      await addVideoToPlaylist(video._id, playlistId);
      setPlaylistMessage('Added to playlist');
      setTimeout(() => setPlaylistMessage(''), 2000);
    } catch (error) {
      console.error('Error adding to playlist:', error);
      setPlaylistMessage(error.response?.data?.message || 'Failed to add to playlist');
    } finally {
      setAddingPlaylistId('');
      setIsPlaylistOpen(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!currentUser?.accessToken) {
      setCommentError('Please log in to comment.');
      return;
    }

    try {
      await addComment(videoId, { content: newComment });
      setNewComment('');
      setCommentError('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      setCommentError(error.response?.data?.message || 'Failed to add comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Video not found</h2>
          <Link to="/" className="text-purple-400 hover:text-purple-300">Go back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden aspect-video mb-4">
              <video
                controls
                className="w-full h-full"
                poster={video.thumbnail}
                src={video.videoFile}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Info */}
            <div className="bg-gray-800 rounded-lg p-6 mb-4">
              <h1 className="text-2xl font-bold text-white mb-4">{video.title}</h1>
              
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4 text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                    {video.views || 0} views
                  </span>
                  <span>•</span>
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition duration-200 ${
                      isLiked
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                    </svg>
                    Like
                  </button>

                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition duration-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                    </svg>
                    Share
                  </button>

                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition duration-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                    </svg>
                    Save
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setIsPlaylistOpen((prev) => !prev)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition duration-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 3a1 1 0 00-1 1v12a1 1 0 001.555.832L10 13.202l5.445 3.63A1 1 0 0017 16V4a1 1 0 00-1-1H4z" />
                      </svg>
                      Add to playlist
                    </button>
                    {isPlaylistOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                        <div className="px-3 py-2 border-b border-gray-700 text-sm text-gray-300">Select playlist</div>
                        <div className="max-h-64 overflow-y-auto">
                          {Array.isArray(playlists) && playlists.length > 0 ? (
                            playlists.map((pl) => (
                              <button
                                key={pl._id}
                                onClick={() => handleAddToPlaylist(pl._id)}
                                className="w-full text-left px-3 py-2 text-gray-200 hover:bg-gray-700 flex items-center justify-between"
                                disabled={addingPlaylistId === pl._id}
                              >
                                <span className="truncate">{pl.name || 'Untitled playlist'}</span>
                                {addingPlaylistId === pl._id && (
                                  <svg className="w-4 h-4 animate-spin text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" opacity="0.25" />
                                    <path d="M22 12a10 10 0 00-10-10" />
                                  </svg>
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-3 text-sm text-gray-400">No playlists found</div>
                          )}
                        </div>
                        <button
                          onClick={() => setIsPlaylistOpen(false)}
                          className="w-full text-center px-3 py-2 text-sm text-gray-400 hover:text-gray-200 border-t border-gray-700"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {playlistMessage && (
                  <div className="text-sm text-gray-300 mt-2">{playlistMessage}</div>
                )}
              </div>

              {/* Channel Info */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <Link to={`/channel/${video.owner?.username}`} className="flex items-center gap-4 group">
                  <img
                    src={video.owner?.avatar || PLACEHOLDER_AVATAR}
                    alt={video.owner?.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-purple-400 transition duration-200">
                      {video.owner?.fullname || video.owner?.fullName || 'Unknown Creator'}
                    </h3>
                    <p className="text-gray-400 text-sm">{video.owner?.subscribersCount || 0} subscribers</p>
                  </div>
                </Link>
                {currentUser?._id !== video.owner?._id && (
                  <button
                    onClick={handleSubscribe}
                    className={`px-6 py-2 rounded-full font-semibold transition duration-200 ${
                      isSubscribed
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <div className={`text-gray-300 ${showFullDescription ? '' : 'line-clamp-3'}`}>
                  {video.description || 'No description available.'}
                </div>
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-purple-400 text-sm mt-2 hover:text-purple-300"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6">{comments.length} Comments</h2>

              {/* Add Comment */}
              <form onSubmit={handleAddComment} className="mb-8">
                <div className="flex gap-4">
                  <img
                    src={PLACEHOLDER_AVATAR}
                    alt="Your avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="3"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setNewComment('')}
                        className="px-4 py-2 text-gray-400 hover:text-white transition duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </form>
              {commentError && (
                <div className="text-red-400 text-sm mb-4">{commentError}</div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-4">
                    <img
                      src={comment.owner?.avatar || PLACEHOLDER_AVATAR}
                      alt={comment.owner?.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold">{comment.owner?.username || 'Anonymous'}</span>
                        <span className="text-gray-500 text-sm">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-300 mb-2">{comment.content}</p>
                      <div className="flex items-center gap-4">
                        <button className="text-gray-400 hover:text-white text-sm transition duration-200">
                          <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                          </svg>
                          {comment.likes || 0}
                        </button>
                        <button className="text-gray-400 hover:text-white text-sm transition duration-200">Reply</button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-400 hover:text-red-300 text-sm transition duration-200 ml-auto"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold text-lg mb-4">Related Videos</h3>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Link key={i} to="#" className="flex gap-3 group">
                  <div className="w-40 h-24 bg-gray-800 rounded-lg flex-shrink-0 relative overflow-hidden">
                    <img
                      src={PLACEHOLDER_RELATED}
                      alt="Related video"
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-purple-400 transition duration-200">
                      Related Video Title {i + 1}
                    </h4>
                    <p className="text-gray-400 text-xs mt-1">Channel Name</p>
                    <p className="text-gray-500 text-xs">1.2M views • 2 days ago</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}