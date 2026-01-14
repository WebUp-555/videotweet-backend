import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVideoById, updateVideo, deleteVideo, togglePublishStatus } from '../api/api';

export default function EditVideo() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      const response = await getVideoById(videoId);
      const videoData = response.data.data;
      setVideo(videoData);
      setFormData({
        title: videoData.title || '',
        description: videoData.description || '',
      });
      setThumbnailPreview(videoData.thumbnail);
    } catch (error) {
      console.error('Error fetching video:', error);
      setError('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      if (thumbnail) {
        data.append('thumbnail', thumbnail);
      }

      await updateVideo(videoId, data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      try {
        await deleteVideo(videoId);
        navigate('/dashboard');
      } catch (error) {
        setError('Failed to delete video');
      }
    }
  };

  const handleTogglePublish = async () => {
    try {
      await togglePublishStatus(videoId);
      fetchVideo();
    } catch (error) {
      setError('Failed to toggle publish status');
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
          <button onClick={() => navigate('/dashboard')} className="text-purple-400 hover:text-purple-300">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Edit Video</h2>
              <p className="text-gray-400">Update your video details</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-400 hover:text-white transition duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Video Preview */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Video Preview</h3>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              controls
              className="w-full h-full"
              poster={video.thumbnail}
              src={video.videoFile}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{video.views || 0} views</span>
              <span>•</span>
              <span>{video.likes || 0} likes</span>
              <span>•</span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Status:</span>
              <button
                onClick={handleTogglePublish}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  video.isPublished
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                }`}
              >
                {video.isPublished ? 'Published' : 'Unpublished'}
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                placeholder="Enter video title"
                maxLength={100}
              />
              <p className="mt-1 text-sm text-gray-500">{formData.title.length}/100</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="6"
                value={formData.description}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition duration-200"
                placeholder="Tell viewers about your video"
                maxLength={5000}
              />
              <p className="mt-1 text-sm text-gray-500">{formData.description.length}/5000</p>
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thumbnail
              </label>
              {thumbnailPreview && (
                <div className="mb-4 relative group">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition duration-200 rounded-lg flex items-center justify-center">
                    <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition duration-200">
                      <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium">
                        Change Thumbnail
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
              {!thumbnailPreview && (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors bg-gray-700/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                    </svg>
                    <p className="text-sm text-gray-400">
                      <span className="font-semibold">Click to upload new thumbnail</span>
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 px-4 border border-gray-600 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition duration-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="py-3 px-6 bg-red-600/10 border border-red-600/50 text-red-400 font-medium rounded-lg hover:bg-red-600/20 transition duration-200"
              >
                Delete Video
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <div>
              <h4 className="text-blue-400 font-medium mb-1">Tips for better engagement</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Make sure your title is clear and descriptive</li>
                <li>• Add relevant keywords in your description</li>
                <li>• Use an eye-catching thumbnail that represents your content</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}