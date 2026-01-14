import axios from 'axios';

// Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://videotweet-backend.onrender.com/api/v1';

console.log('API Base URL:', API_BASE_URL); // Debug log

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                if (userData.accessToken) {
                    config.headers.Authorization = `Bearer ${userData.accessToken}`;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear user data and redirect to login
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============ USER APIs ============

// Register a new user (with avatar and coverImage files)
export const registerUser = (formData) => {
    return apiClient.post('/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Login user
export const loginUser = (credentials) => {
    return apiClient.post('/users/login', credentials);
};

// Logout user (secured)
export const logoutUser = () => {
    return apiClient.post('/users/logout');
};

// Refresh access token
export const refreshAccessToken = () => {
    return apiClient.post('/users/refresh-token');
};

// Verify email with code
export const verifyEmail = (data) => {
    return apiClient.post('/users/verify-email', data);
};

// Forgot password - send verification code
export const forgotPassword = (data) => {
    return apiClient.post('/users/forgot-password', data);
};

// Reset password with code
export const resetPassword = (data) => {
    return apiClient.post('/users/reset-password', data);
};

// Change current password (secured)
export const changeCurrentPassword = (passwordData) => {
    return apiClient.post('/users/change-password', passwordData);
};

// Get current user details (secured)
export const getCurrentUser = () => {
    return apiClient.get('/users/current-user');
};

// Update account details (secured)
export const updateAccountDetails = (accountData) => {
    return apiClient.patch('/users/update-account', accountData);
};

// Update user avatar (secured)
export const updateUserAvatar = (formData) => {
    return apiClient.patch('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Update user cover image (secured)
export const updateUserCoverImage = (formData) => {
    return apiClient.patch('/users/cover-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Get user channel profile (secured)
export const getUserChannelProfile = (username) => {
    return apiClient.get(`/users/c/${username}`);
};

// Get watch history (secured)
export const getWatchHistory = () => {
    return apiClient.get('/users/watchHistory');
};

// Add video to watch history (secured)
export const addToWatchHistory = (videoId) => {
    return apiClient.post(`/users/watchHistory/${videoId}`);
};

// ============ VIDEO APIs ============

// Get all videos with optional filters (secured)
export const getAllVideos = (params) => {
    return apiClient.get('/videos', { params });
};

// Publish a video (secured)
export const publishVideo = (formData) => {
    return apiClient.post('/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Get video by ID (secured)
export const getVideoById = (videoId) => {
    return apiClient.get(`/videos/${videoId}`);
};

// Update video (secured)
export const updateVideo = (videoId, formData) => {
    return apiClient.patch(`/videos/${videoId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// Delete video (secured)
export const deleteVideo = (videoId) => {
    return apiClient.delete(`/videos/${videoId}`);
};

// Toggle video publish status (secured)
export const togglePublishStatus = (videoId) => {
    return apiClient.patch(`/videos/toggle/publish/${videoId}`);
};

// ============ COMMENT APIs ============

// Get video comments (secured)
export const getVideoComments = (videoId, params) => {
    return apiClient.get(`/comments/${videoId}`, { params });
};

// Add comment to video (secured)
export const addComment = (videoId, commentData) => {
    return apiClient.post(`/comments/${videoId}`, commentData);
};

// Update comment (secured)
export const updateComment = (commentId, commentData) => {
    return apiClient.patch(`/comments/c/${commentId}`, commentData);
};

// Delete comment (secured)
export const deleteComment = (commentId) => {
    return apiClient.delete(`/comments/c/${commentId}`);
};

// ============ TWEET APIs ============

// Create tweet (secured)
export const createTweet = (tweetData) => {
    return apiClient.post('/tweets', tweetData);
};

// Get user tweets (secured)
export const getUserTweets = (userId) => {
    return apiClient.get(`/tweets/user/${userId}`);
};

// Update tweet (secured)
export const updateTweet = (tweetId, tweetData) => {
    return apiClient.patch(`/tweets/${tweetId}`, tweetData);
};

// Delete tweet (secured)
export const deleteTweet = (tweetId) => {
    return apiClient.delete(`/tweets/${tweetId}`);
};

// Get all tweets (secured)
export const getAllTweets = () => {
    return apiClient.get('/tweets');
};

// ============ PLAYLIST APIs ============

// Create playlist (secured)
export const createPlaylist = (playlistData) => {
    return apiClient.post('/playlists', playlistData);
};

// Get playlist by ID (secured)
export const getPlaylistById = (playlistId) => {
    return apiClient.get(`/playlists/${playlistId}`);
};

// Update playlist (secured)
export const updatePlaylist = (playlistId, playlistData) => {
    return apiClient.patch(`/playlists/${playlistId}`, playlistData);
};

// Delete playlist (secured)
export const deletePlaylist = (playlistId) => {
    return apiClient.delete(`/playlists/${playlistId}`);
};

// Add video to playlist (secured)
export const addVideoToPlaylist = (videoId, playlistId) => {
    return apiClient.patch(`/playlists/add/${videoId}/${playlistId}`);
};

// Remove video from playlist (secured)
export const removeVideoFromPlaylist = (videoId, playlistId) => {
    return apiClient.patch(`/playlists/remove/${videoId}/${playlistId}`);
};

// Get user playlists (secured)
export const getUserPlaylists = (userId) => {
    return apiClient.get(`/playlists/user/${userId}`);
};

// ============ SUBSCRIPTION APIs ============

// Get subscribed channels (secured)
export const getSubscribedChannels = (channelId) => {
    return apiClient.get(`/subscriptions/c/${channelId}`);
};

// Toggle subscription (secured)
export const toggleSubscription = (channelId) => {
    return apiClient.post(`/subscriptions/c/${channelId}`);
};

// Get user channel subscribers (secured)
export const getUserChannelSubscribers = (subscriberId) => {
    return apiClient.get(`/subscriptions/u/${subscriberId}`);
};

// ============ LIKE APIs ============

// Toggle video like (secured)
export const toggleVideoLike = (videoId) => {
    return apiClient.post(`/likes/toggle/v/${videoId}`);
};

// Toggle comment like (secured)
export const toggleCommentLike = (commentId) => {
    return apiClient.post(`/likes/toggle/c/${commentId}`);
};

// Toggle tweet like (secured)
export const toggleTweetLike = (tweetId) => {
    return apiClient.post(`/likes/toggle/t/${tweetId}`);
};

// Get liked videos (secured)
export const getLikedVideos = () => {
    return apiClient.get('/likes/videos');
};

// ============ DASHBOARD APIs ============

// Get channel stats (secured)
export const getChannelStats = () => {
    return apiClient.get('/dashboard/stats');
};

// Get channel videos (secured)
export const getChannelVideos = () => {
    return apiClient.get('/dashboard/videos');
};

// Get channel comments (secured)
export const getChannelComments = () => {
    return apiClient.get('/dashboard/comments');
};

// ============ HEALTHCHECK APIs ============

// Health check
export const healthCheck = () => {
    return apiClient.get('/healthcheck');
};

export default apiClient;
