import { useState, useEffect, useRef } from 'react';
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
  addVideoToPlaylist,
  addToWatchHistory,
  getAllVideos,
} from '../api/api';

export default function VideoDetail() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [addingPlaylistId, setAddingPlaylistId] = useState('');
  const [playlistMessage, setPlaylistMessage] = useState('');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [commentsSort, setCommentsSort] = useState('Top comments');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef(null);
  const actionMenuRef = useRef(null);
  const sortMenuRef = useRef(null);
  const playlistPanelRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCompactNumber = (value) => {
    const numeric = Number(value || 0);
    if (numeric >= 1000000) return `${(numeric / 1000000).toFixed(1)}M`;
    if (numeric >= 1000) return `${(numeric / 1000).toFixed(1)}K`;
    return `${numeric}`;
  };

  const formatDateLabel = (dateValue) => {
    if (!dateValue) return 'Recently';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const days = Math.floor(diffMs / dayMs);

    if (days <= 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchVideo();
    fetchComments();
    fetchRelatedVideos();
  }, [videoId]);

  useEffect(() => {
    if (currentUser?._id) {
      loadPlaylists();
    }
  }, [currentUser?._id]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setShowActionMenu(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
      if (playlistPanelRef.current && !playlistPanelRef.current.contains(event.target)) {
        setIsPlaylistOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchVideo = async () => {
    try {
      const response = await getVideoById(videoId);
      const videoData = response.data.data;
      setVideo(videoData);
      setIsLiked(videoData?.isLiked || false);
      setLikesCount(videoData?.likesCount || 0);
      setIsSubscribed(videoData?.owner?.isSubscribed || false);

      try {
        await addToWatchHistory(videoId);
      } catch (error) {
        console.error('Error adding to watch history:', error);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await getVideoComments(videoId);
      let commentsData = [];
      if (response.data?.data?.docs) {
        commentsData = response.data.data.docs;
      } else if (response.data?.docs) {
        commentsData = response.data.docs;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        commentsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        commentsData = response.data;
      }

      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      setRelatedLoading(true);
      const response = await getAllVideos({ sortBy: 'latest' });
      const videosData = response.data?.data?.docs || response.data?.docs || response.data?.data || [];
      const list = Array.isArray(videosData) ? videosData : [];
      setRelatedVideos(list.filter((item) => item?._id && item._id !== videoId));
    } catch (error) {
      console.error('Error loading related videos:', error);
      setRelatedVideos([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  const loadPlaylists = async () => {
    try {
      const response = await getUserPlaylists(currentUser._id);
      const data = response.data?.data?.playlists || response.data?.playlists || response.data?.data || [];
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
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!currentUser?.accessToken) return;
    if (currentUser?._id && video?.owner?._id && currentUser._id === video.owner._id) return;

    try {
      const response = await toggleSubscription(video.owner._id);
      const newSubscribedStatus = response.data?.data?.isSubscribed;
      if (typeof newSubscribedStatus === 'boolean') {
        setIsSubscribed(newSubscribedStatus);
        setVideo((prev) => ({
          ...prev,
          owner: {
            ...prev.owner,
            isSubscribed: newSubscribedStatus,
          },
        }));
      }
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

    const selectedPlaylist = playlists.find((pl) => pl?._id === playlistId);
    if (isVideoAlreadyInPlaylist(selectedPlaylist, video._id)) {
      setPlaylistMessage('Already in playlist');
      setTimeout(() => setPlaylistMessage(''), 2000);
      return;
    }

    try {
      setAddingPlaylistId(playlistId);
      setPlaylistMessage('');
      await addVideoToPlaylist(video._id, playlistId);
      setPlaylists((prev) =>
        prev.map((pl) => {
          if (pl?._id !== playlistId) return pl;

          const existingVideos = Array.isArray(pl?.videos) ? pl.videos : [];
          return {
            ...pl,
            videos: [...existingVideos, { _id: video._id }],
          };
        })
      );
      setPlaylistMessage('Added to playlist');
      setTimeout(() => setPlaylistMessage(''), 2000);
    } catch (error) {
      console.error('Error adding to playlist:', error);
      setPlaylistMessage(error.response?.data?.message || 'Failed to add to playlist');
    } finally {
      setAddingPlaylistId('');
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

  const handlePlayClick = async () => {
    try {
      if (videoRef.current) {
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Error starting playback:', error);
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (commentsSort === 'Newest first') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const isVideoAlreadyInPlaylist = (playlist, currentVideoId) => {
    if (!playlist || !currentVideoId) return false;
    const videos = Array.isArray(playlist.videos) ? playlist.videos : [];
    const targetId = String(currentVideoId);

    const normalizeId = (value) => {
      if (!value) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'number') return String(value);
      if (typeof value === 'object') {
        if (value._id) return normalizeId(value._id);
        if (value.video) return normalizeId(value.video);
        if (value.videoId) return normalizeId(value.videoId);
        if (value.$oid) return String(value.$oid);
        if (typeof value.toString === 'function') {
          const converted = value.toString();
          if (converted && converted !== '[object Object]') return converted;
        }
      }
      return '';
    };

    return videos.some((item) => {
      const normalized = normalizeId(item);
      return normalized === targetId;
    });
  };

  const isSavedInAnyPlaylist = Array.isArray(playlists)
    ? playlists.some((playlist) => isVideoAlreadyInPlaylist(playlist, video?._id))
    : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Video not found</h2>
          <Link to="/" className="text-emerald-400 hover:text-emerald-300">Go back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black">
      <div className="mx-auto flex w-full max-w-7xl gap-0">
        <div className="w-full lg:w-[calc(100%-384px)] px-6 py-6 sm:px-4">
          <div className="w-full flex flex-col gap-4">
            <div className="relative w-full overflow-hidden rounded-lg bg-black aspect-video border border-gray-800">
              <video
                ref={videoRef}
                controls
                className="w-full h-full"
                poster={video.thumbnail}
                src={video.videoFile}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              >
                Your browser does not support the video tag.
              </video>

              {!isPlaying && (
                <button
                  type="button"
                  onClick={handlePlayClick}
                  className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-black/60 border border-emerald-500/60 text-emerald-400 flex items-center justify-center hover:bg-emerald-900/30 hover:text-emerald-300 transition"
                  aria-label="Play video"
                >
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 4l10 6-10 6V4z" />
                  </svg>
                </button>
              )}
            </div>

            <div className="w-full flex flex-col gap-4">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">{video.title || 'Untitled video'}</h1>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                  <span className="rounded-full border border-gray-800 bg-gray-900 px-2.5 py-1">{formatCompactNumber(video.views)} views</span>
                  <span className="text-gray-600">•</span>
                  <span>{formatDateLabel(video.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleLike}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isLiked ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300'
                    }`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M2 21h4V9H2v12zm20-11c0-1.1-.9-2-2-2h-6.3l1-4.8.03-.32c0-.41-.17-.79-.44-1.06L13 1 6.59 7.41C6.22 7.78 6 8.3 6 8.83V19c0 1.1.9 2 2 2h9c.82 0 1.53-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                    </svg>
                    <span>{formatCompactNumber(likesCount)}</span>
                  </button>
                  <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300 text-sm">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a2.5 2.5 0 000-1.39l7-4.11A3 3 0 1014 5a2.9 2.9 0 00.04.49l-7 4.12a3 3 0 100 4.78l7.05 4.14A2.9 2.9 0 0014 19a3 3 0 103-2.92z" />
                    </svg>
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => setIsPlaylistOpen((prev) => !prev)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                      isSavedInAnyPlaylist
                        ? 'bg-emerald-700/20 border border-emerald-700/40 text-emerald-300 hover:bg-emerald-700/30'
                        : 'bg-gray-900 text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300'
                    }`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17 3H5a2 2 0 00-2 2v16l8-3.5L19 21V5a2 2 0 00-2-2z" />
                    </svg>
                    <span>{isSavedInAnyPlaylist ? 'Added to playlist' : 'Add to playlist'}</span>
                  </button>

                  <div className="relative" ref={actionMenuRef}>
                    <button
                      onClick={() => setShowActionMenu((prev) => !prev)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300 text-sm"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                      <span>More</span>
                    </button>
                    {showActionMenu && (
                      <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-gray-800 bg-gray-900 shadow-lg p-2">
                        <button className="w-full text-left rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300">Share</button>
                        <button className="w-full text-left rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300">Save to playlist</button>
                        <button className="w-full text-left rounded-md px-3 py-2 text-sm text-red-400 hover:bg-emerald-900/30">Report</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isPlaylistOpen && (
                <div ref={playlistPanelRef} className="rounded-lg border border-gray-800 bg-gray-900 p-2">
                  <div className="text-sm text-gray-300 px-2 py-1">Select playlist</div>
                  <div className="max-h-56 overflow-y-auto">
                    {Array.isArray(playlists) && playlists.length > 0 ? (
                      playlists.map((pl) => {
                        const alreadyInPlaylist = isVideoAlreadyInPlaylist(pl, video?._id);
                        return (
                          <button
                            key={pl._id}
                            onClick={() => handleAddToPlaylist(pl._id)}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between ${
                              alreadyInPlaylist
                                ? 'text-emerald-300 bg-emerald-950/30 cursor-not-allowed'
                                : 'text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300'
                            }`}
                            disabled={addingPlaylistId === pl._id || alreadyInPlaylist}
                          >
                            <span className="min-w-0">
                              <span className="block truncate">{pl.name || 'Untitled playlist'}</span>
                              <span className={`block text-[11px] ${alreadyInPlaylist ? 'text-emerald-400' : 'text-gray-500'}`}>
                                {alreadyInPlaylist ? 'Already in playlist' : 'Tap to add'}
                              </span>
                            </span>
                            {addingPlaylistId === pl._id ? (
                              <svg className="w-4 h-4 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" opacity="0.25" />
                                <path d="M22 12a10 10 0 00-10-10" />
                              </svg>
                            ) : alreadyInPlaylist ? (
                              <span className="rounded-full border border-emerald-700/50 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                                Already in playlist
                              </span>
                            ) : null}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No playlists found</div>
                    )}
                  </div>
                </div>
              )}

              {playlistMessage && <div className="text-sm text-emerald-400">{playlistMessage}</div>}
            </div>

            <div className="w-full rounded-lg border border-gray-800 bg-gray-900 p-5">
              <div className="flex items-center justify-between">
                <Link to={`/channel/${video.owner?.username}`} className="flex items-center gap-3">
                  <img
                    src={video.owner?.avatar || PLACEHOLDER_AVATAR}
                    alt={video.owner?.username || 'Creator avatar'}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-white">{video.owner?.fullname || video.owner?.fullName || 'Unknown Creator'}</div>
                    <div className="text-sm text-gray-400">{video.owner?.subscribersCount || 0} subscribers</div>
                  </div>
                </Link>

                {currentUser?._id !== video.owner?._id && (
                  <button
                    onClick={handleSubscribe}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      isSubscribed
                        ? 'bg-gray-800 text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                )}
              </div>

              <div className="mt-4 rounded-lg border border-gray-800 bg-black/40 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Description</div>
                <p className={`text-gray-300 ${showFullDescription ? '' : 'line-clamp-2'}`}>
                  {video.description || 'No description available.'}
                </p>
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-2 text-sm text-emerald-400 hover:text-emerald-300"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </button>
              </div>
            </div>

            <div className="w-full border-t border-gray-800 pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">{comments.length} Comments</h2>
                <div className="relative" ref={sortMenuRef}>
                  <button
                    onClick={() => setShowSortMenu((prev) => !prev)}
                    className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300"
                  >
                    {commentsSort}
                  </button>
                  {showSortMenu && (
                    <div className="absolute right-0 z-20 mt-2 w-40 rounded-lg border border-gray-800 bg-gray-900 p-2 shadow-lg">
                      <button
                        onClick={() => {
                          setCommentsSort('Top comments');
                          setShowSortMenu(false);
                        }}
                        className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300"
                      >
                        Top comments
                      </button>
                      <button
                        onClick={() => {
                          setCommentsSort('Newest first');
                          setShowSortMenu(false);
                        }}
                        className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300"
                      >
                        Newest first
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleAddComment} className="mb-6 flex items-start gap-3">
                <img src={currentUser?.avatar || PLACEHOLDER_AVATAR} alt="Your avatar" className="h-10 w-10 rounded-full object-cover" />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 resize-none outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
                    rows="3"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewComment('')}
                      className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </form>

              {commentError && <div className="mb-4 text-sm text-red-400">{commentError}</div>}

              <div className="space-y-6">
                {sortedComments.length === 0 && (
                  <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 text-center text-gray-400">
                    No comments yet. Start the conversation.
                  </div>
                )}

                {sortedComments.map((comment) => (
                  <div key={comment._id} className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                    <img
                      src={comment.owner?.avatar || PLACEHOLDER_AVATAR}
                      alt={comment.owner?.username || 'User avatar'}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{comment.owner?.username || 'Anonymous'}</span>
                        <span className="text-xs text-gray-500">{formatDateLabel(comment.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-gray-300">{comment.content}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <button className="inline-flex items-center gap-1 hover:text-emerald-300">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M2 21h4V9H2v12zm20-11c0-1.1-.9-2-2-2h-6.3l1-4.8.03-.32c0-.41-.17-.79-.44-1.06L13 1 6.59 7.41C6.22 7.78 6 8.3 6 8.83V19c0 1.1.9 2 2 2h9c.82 0 1.53-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                          </svg>
                          <span>{comment.likes || 0}</span>
                        </button>
                        <button className="hover:text-emerald-300">Reply</button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="ml-auto text-red-400 hover:text-emerald-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {sortedComments.length > 0 && (
                  <button className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 hover:bg-emerald-900/30 hover:text-emerald-300">
                    Load more comments
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden lg:flex w-[384px] flex-col border-l border-gray-800 bg-black px-4 py-6">
          <h3 className="text-xl font-semibold text-white mb-4">Up next</h3>

          {relatedLoading ? (
            <div className="text-sm text-gray-500">Loading videos...</div>
          ) : relatedVideos.length > 0 ? (
            <div className="space-y-4">
              {relatedVideos.slice(0, 10).map((item) => (
                <Link key={item._id} to={`/video/${item._id}`} className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative h-24 w-40 overflow-hidden rounded-md bg-gray-900 border border-gray-800">
                    <img className="h-full w-full object-cover" src={item.thumbnail || PLACEHOLDER_RELATED} alt={item.title || 'Related video'} />
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[10px] font-semibold text-white">
                      {formatDuration(item.duration)}
                    </span>
                    <span className="absolute inset-0 m-auto h-8 w-8 rounded-full bg-black/60 border border-emerald-500/50 text-emerald-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 4l10 6-10 6V4z" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-gray-100 group-hover:text-emerald-300 transition">
                      {item.title || 'Untitled video'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{item.owner?.username || 'Creator'}</p>
                    <p className="text-xs text-gray-500">{item.views || 0} views  {new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No uploaded videos available.</div>
          )}
        </aside>
      </div>
    </div>
  );
}
