import { useState, useEffect } from 'react';
import { getAllTweets, createTweet, updateTweet, deleteTweet, toggleTweetLike } from '../api/api';

const PLACEHOLDER_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='48' height='48' rx='24' ry='24' fill='%23333'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23bbb' font-family='Arial' font-size='20'>U</text></svg>";

export default function TweetsPage() {
  const [tweets, setTweets] = useState([]);
  const [newTweet, setNewTweet] = useState('');
  const [editingTweet, setEditingTweet] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('user')) || null;

  useEffect(() => {
    fetchTweets();
  }, []);

  const fetchTweets = async () => {
    try {
      const response = await getAllTweets();
      const tweetsData = response.data?.data?.tweets || response.data?.tweets || response.data?.data || [];
      setTweets(Array.isArray(tweetsData) ? tweetsData : []);
    } catch (error) {
      setTweets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTweet = async (e) => {
    e.preventDefault();
    if (!newTweet.trim()) return;

    try {
      const response = await createTweet({ content: newTweet });
      setNewTweet('');
      await fetchTweets();
    } catch (error) {
      alert('Failed to create tweet: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateTweet = async (tweetId, content) => {
    try {
      await updateTweet(tweetId, { content });
      setEditingTweet(null);
      fetchTweets();
    } catch (error) {
      console.error('Error updating tweet:', error);
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    if (window.confirm('Are you sure you want to delete this tweet?')) {
      try {
        await deleteTweet(tweetId);
        fetchTweets();
      } catch (error) {
        console.error('Error deleting tweet:', error);
      }
    }
  };

  const handleLikeTweet = async (tweetId) => {
    try {
      const response = await toggleTweetLike(tweetId);
      const isLiked = response.data?.data?.isLiked;
      
      // Update the tweet in the local state
      setTweets(prevTweets => 
        prevTweets.map(tweet => 
          tweet._id === tweetId 
            ? {
                ...tweet,
                isLiked: isLiked,
                likesCount: isLiked 
                  ? (tweet.likesCount || 0) + 1 
                  : Math.max((tweet.likesCount || 0) - 1, 0)
              }
            : tweet
        )
      );
    } catch (error) {
      console.error('Error liking tweet:', error);
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Tweets</h1>
            <p className="text-blue-100">Share your thoughts with the community</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Tweet */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <form onSubmit={handleCreateTweet}>
            <div className="flex gap-4">
              <img
                src={PLACEHOLDER_AVATAR}
                alt="Your avatar"
                className="w-12 h-12 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={newTweet}
                  onChange={(e) => setNewTweet(e.target.value)}
                  placeholder="What's happening?"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600 placeholder-gray-400"
                  rows="3"
                  maxLength={280}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-400">
                    {newTweet.length}/280
                  </span>
                  <button
                    type="submit"
                    disabled={!newTweet.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    Tweet
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Tweets List */}
        <div className="space-y-4">
          {Array.isArray(tweets) && tweets.length > 0 ? tweets.map((tweet) => (
            <div key={tweet._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition duration-200">
              <div className="flex gap-4">
                <img
                  src={tweet.owner?.avatar || PLACEHOLDER_AVATAR}
                  alt={tweet.owner?.username}
                  className="w-12 h-12 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-semibold">{tweet.owner?.fullName || 'Anonymous'}</span>
                    <span className="text-gray-400">@{tweet.owner?.username || 'unknown'}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(tweet.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {editingTweet === tweet._id ? (
                    <div>
                      <textarea
                        defaultValue={tweet.content}
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                        rows="3"
                        id={`edit-${tweet._id}`}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const content = document.getElementById(`edit-${tweet._id}`).value;
                            handleUpdateTweet(tweet._id, content);
                          }}
                          className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition duration-200"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTweet(null)}
                          className="px-4 py-1.5 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-200 mb-4">{tweet.content}</p>

                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLikeTweet(tweet._id)}
                          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition duration-200 group"
                        >
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill={tweet.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="text-sm">{tweet.likesCount || 0}</span>
                        </button>

                        <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition duration-200 group">
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-sm">{tweet.commentsCount || 0}</span>
                        </button>

                        <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition duration-200 group">
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>

                        {/* Only show edit/delete for own tweets */}
                        {currentUser?._id === tweet.owner?._id && (
                          <div className="ml-auto flex gap-2">
                            <button
                              onClick={() => setEditingTweet(tweet._id)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition duration-200"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteTweet(tweet._id)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-full transition duration-200"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )) : !loading && (
            <div className="text-center py-20">
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
              </svg>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No tweets yet</h3>
              <p className="text-gray-500">Be the first to tweet something!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}