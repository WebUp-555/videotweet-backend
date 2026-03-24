import { useState, useEffect } from 'react';
import { getAllTweets, createTweet, updateTweet, deleteTweet, toggleTweetLike } from '../api/api';

const PLACEHOLDER_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='48' height='48' rx='24' ry='24' fill='%23333'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23bbb' font-family='Arial' font-size='20'>U</text></svg>";

export default function TweetsPage() {
  const [tweets, setTweets] = useState([]);
  const [newTweet, setNewTweet] = useState('');
  const [editingTweet, setEditingTweet] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('user')) || null;

  const trendingItems = [
    { id: 1, label: 'Technology  Trending', tag: '#WebDevelopment', posts: '124K posts' },
    { id: 2, label: 'Gaming  Trending', tag: 'E3 Announcements', posts: '85.2K posts' },
    { id: 3, label: 'Entertainment  Trending', tag: '#CreatorAwards', posts: '42.1K posts' },
  ];

  const suggestedCreators = [
    { id: 1, name: 'Chill Music', username: '@chillbeats', avatar: PLACEHOLDER_AVATAR, verified: true },
    { id: 2, name: 'Cooking with Sarah', username: '@sarahcooks', avatar: PLACEHOLDER_AVATAR, verified: false },
  ];

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
      await createTweet({ content: newTweet });
      setNewTweet('');
      await fetchTweets();
    } catch (error) {
      alert('Failed to create tweet: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateTweet = async (tweetId) => {
    if (!editContent.trim()) return;
    try {
      await updateTweet(tweetId, { content: editContent });
      setEditingTweet(null);
      setEditContent('');
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

      setTweets((prevTweets) =>
        prevTweets.map((tweet) =>
          tweet._id === tweetId
            ? {
                ...tweet,
                isLiked,
                likesCount: isLiked
                  ? (tweet.likesCount || 0) + 1
                  : Math.max((tweet.likesCount || 0) - 1, 0),
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-black px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
      <div className="mx-auto flex w-full max-w-7xl items-start justify-center gap-4 lg:gap-8">
        <aside className="sticky top-20 hidden w-60 flex-none flex-col gap-2 lg:flex">
          <button className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-left hover:bg-gray-800 transition-colors">
            <span className="font-semibold text-gray-100">Home</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-md bg-gray-800 px-4 py-3 text-left">
            <span className="font-semibold text-emerald-400">Community</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-left hover:bg-gray-800 transition-colors">
            <span className="font-semibold text-gray-100">Explore</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-left hover:bg-gray-800 transition-colors">
            <span className="font-semibold text-gray-100">Notifications</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-left hover:bg-gray-800 transition-colors">
            <span className="font-semibold text-gray-100">Profile</span>
          </button>
          <button className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700 transition">
            Post Update
          </button>
        </aside>

        <main className="min-w-0 w-full max-w-[640px] overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-sm">
          <div className="sticky top-16 z-10 flex w-full items-center border-b border-gray-800 bg-gray-900/95 px-3 py-3 backdrop-blur-md sm:px-4">
            <span className="text-lg font-semibold text-white sm:text-xl">Community Posts</span>
          </div>

          <div className="w-full border-b border-gray-800 px-3 py-4 sm:px-4">
            <form onSubmit={handleCreateTweet}>
              <div className="flex w-full items-start gap-3">
                <img className="mt-1 h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10" src={PLACEHOLDER_AVATAR} alt="Your avatar" />
                <div className="min-w-0 flex-1">
                  <textarea
                    value={newTweet}
                    onChange={(e) => setNewTweet(e.target.value)}
                    className="min-h-[90px] w-full resize-none rounded-md border border-gray-800 px-3 py-2 text-gray-100 outline-none placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
                    placeholder="What's happening in the community?"
                    maxLength={280}
                  />
                </div>
              </div>

              <div className="mt-3 flex w-full flex-wrap items-center justify-between gap-y-2 border-t border-gray-800 pt-3">
                <div className="flex items-center gap-1 text-gray-400">
                  <button type="button" className="rounded-full p-2 hover:bg-gray-800">IMG</button>
                  <button type="button" className="rounded-full p-2 hover:bg-gray-800">VID</button>
                  <button type="button" className="rounded-full p-2 hover:bg-gray-800">EMO</button>
                  <button type="button" className="rounded-full p-2 hover:bg-gray-800">LOC</button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{newTweet.length}/280</span>
                  <button
                    type="submit"
                    disabled={!newTweet.trim()}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post
                  </button>
                </div>
              </div>
            </form>
          </div>

          {Array.isArray(tweets) && tweets.length > 0 ? (
            tweets.map((tweet) => (
              <article key={tweet._id} className="w-full border-b border-gray-800 px-3 py-4 transition-colors hover:bg-gray-950 sm:px-4">
                <div className="flex w-full items-start gap-3">
                  <img
                    className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
                    src={tweet.owner?.avatar || PLACEHOLDER_AVATAR}
                    alt={tweet.owner?.username || 'User avatar'}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex w-full items-start justify-between gap-2">
                      <div className="min-w-0 flex flex-wrap items-center gap-1">
                        <span className="max-w-full truncate font-semibold text-white hover:underline">{tweet.owner?.fullName || 'Anonymous'}</span>
                        <span className="text-sm text-gray-400">@{tweet.owner?.username || 'unknown'}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-400">{new Date(tweet.createdAt).toLocaleDateString()}</span>
                      </div>
                      <button className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-800">...</button>
                    </div>

                    {editingTweet === tweet._id ? (
                      <div className="mt-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full resize-none rounded-md border border-gray-700 px-3 py-2 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/40"
                          rows="3"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleUpdateTweet(tweet._id)}
                            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingTweet(null);
                              setEditContent('');
                            }}
                            className="rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-800"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="mt-1 whitespace-pre-wrap text-gray-100">{tweet.content}</p>

                        <div className="mt-3 flex w-full flex-wrap items-center gap-x-2 gap-y-1 sm:gap-x-4">
                          <button className="flex items-center gap-1 text-gray-400 transition hover:text-emerald-400">
                            <span className="rounded-full p-2 hover:bg-emerald-900/20">C</span>
                            <span className="pr-2 text-xs">{tweet.commentsCount || 0}</span>
                          </button>

                          <button className="flex items-center gap-1 text-gray-400 transition hover:text-emerald-400">
                            <span className="rounded-full p-2 hover:bg-emerald-900/20">R</span>
                            <span className="pr-2 text-xs">0</span>
                          </button>

                          <button
                            onClick={() => handleLikeTweet(tweet._id)}
                            className="flex items-center gap-1 text-gray-400 transition hover:text-emerald-400"
                          >
                            <span className="rounded-full p-2 hover:bg-emerald-900/20">H</span>
                            <span className="pr-2 text-xs">{tweet.likesCount || 0}</span>
                          </button>

                          <button className="flex items-center gap-1 text-gray-400 transition hover:text-emerald-400">
                            <span className="rounded-full p-2 hover:bg-emerald-900/20">S</span>
                          </button>
                        </div>

                        {currentUser?._id === tweet.owner?._id && (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => {
                                setEditingTweet(tweet._id);
                                setEditContent(tweet.content || '');
                              }}
                              className="rounded-md border border-gray-700 px-3 py-1.5 text-xs text-gray-200 hover:bg-gray-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTweet(tweet._id)}
                              className="rounded-md border border-gray-700 px-3 py-1.5 text-xs text-gray-200 hover:bg-emerald-900/20 hover:text-emerald-300"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="w-full py-16 text-center">
              <h3 className="text-lg font-semibold text-gray-200 mb-1">No posts yet</h3>
              <p className="text-gray-400">Be the first to post something in the community.</p>
            </div>
          )}

        </main>

        <aside className="sticky top-20 hidden w-80 flex-none flex-col gap-4 lg:flex">
          <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-sm">
            <div className="px-4 py-3 text-lg font-semibold text-white">Trending Now</div>
            {trendingItems.map((item, idx) => (
              <button key={item.id} className="w-full px-4 py-3 text-left hover:bg-gray-950 transition-colors">
                <div className="text-xs text-gray-400">{idx + 1}  {item.label}</div>
                <div className="font-semibold text-white">{item.tag}</div>
                <div className="text-xs text-gray-400">{item.posts}</div>
              </button>
            ))}
            <button className="w-full px-4 py-3 text-left text-emerald-400 hover:bg-gray-950">Show more</button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-sm">
            <div className="px-4 py-3 text-lg font-semibold text-white">Suggested Creators</div>
            {suggestedCreators.map((creator) => (
              <div key={creator.id} className="flex w-full items-center justify-between px-4 py-3 hover:bg-gray-950 transition-colors">
                <div className="flex items-center gap-2">
                  <img className="h-10 w-10 rounded-full object-cover" src={creator.avatar} alt={creator.name} />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-white">{creator.name}</span>
                      {creator.verified && <span className="text-xs text-emerald-400">v</span>}
                    </div>
                    <span className="text-xs text-gray-400">{creator.username}</span>
                  </div>
                </div>
                <button className="rounded-md border border-gray-700 px-3 py-1 text-sm text-gray-200 hover:bg-gray-800">Follow</button>
              </div>
            ))}
            <button className="w-full px-4 py-3 text-left text-emerald-400 hover:bg-gray-950">Show more</button>
          </div>

          <div className="flex flex-wrap items-start gap-x-3 gap-y-1 px-1">
            <span className="cursor-pointer text-xs text-gray-400 hover:underline">Terms of Service</span>
            <span className="cursor-pointer text-xs text-gray-400 hover:underline">Privacy Policy</span>
            <span className="cursor-pointer text-xs text-gray-400 hover:underline">Cookie Policy</span>
            <span className="cursor-pointer text-xs text-gray-400 hover:underline">Accessibility</span>
            <span className="cursor-pointer text-xs text-gray-400 hover:underline">Ads info</span>
            <span className="text-xs text-gray-400"> 2024 StreamVid Corp.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}


