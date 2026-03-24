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
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
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
      setVideoPreview(videoData.videoFile);
    } catch (fetchError) {
      console.error('Error fetching video:', fetchError);
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

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
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
      if (videoFile) {
        data.append('videoFile', videoFile);
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
      } catch (deleteError) {
        setError('Failed to delete video');
      }
    }
  };

  const handleTogglePublish = async () => {
    try {
      await togglePublishStatus(videoId);
      fetchVideo();
    } catch (toggleError) {
      setError('Failed to toggle publish status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-700 border-t-emerald-600"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-white">Video not found</h2>
          <button onClick={() => navigate('/dashboard')} className="mt-3 text-sm font-semibold text-emerald-400 hover:text-emerald-300">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Edit Video</h1>
              <p className="mt-1 text-sm text-gray-400">Update your video details</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-gray-800"
            >
              Back to Dashboard
            </button>
          </div>
          <div className="mt-6 h-px w-full bg-slate-200" />

          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </section>

        <section className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-white">Video Preview</h2>
          <div className="overflow-hidden rounded-xl border border-gray-800 bg-black">
            <video controls className="aspect-video w-full" poster={video.thumbnail} src={video.videoFile}>
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gray-800 px-3 py-1">{video.views || 0} views</span>
              <span className="rounded-full bg-gray-800 px-3 py-1">{formatDuration(video.duration)} runtime</span>
              <span className="rounded-full bg-gray-800 px-3 py-1">{video.likes || 0} likes</span>
              <span className="rounded-full bg-gray-800 px-3 py-1">{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
            <button
              onClick={handleTogglePublish}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                video.isPublished
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-400'
                  : 'border-gray-700 bg-gray-800 text-gray-300'
              }`}
            >
              {video.isPublished ? 'Published' : 'Unpublished'}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-200">
                Title <span className="text-rose-600">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                maxLength={100}
                className="block w-full rounded-lg border border-gray-700 px-4 py-2.5 text-gray-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Enter video title"
              />
              <p className="mt-1 text-xs text-gray-400">{formData.title.length}/100</p>
            </div>

            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-200">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="6"
                value={formData.description}
                onChange={handleChange}
                maxLength={5000}
                className="block w-full resize-none rounded-lg border border-gray-700 px-4 py-2.5 text-gray-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Tell viewers about your video"
              />
              <p className="mt-1 text-xs text-gray-400">{formData.description.length}/5000</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Video File</label>
              <div className="rounded-xl border border-gray-800 bg-black p-3">
                {videoPreview ? (
                  <video controls className="aspect-video w-full rounded-lg bg-black" src={videoPreview}>
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <p className="py-10 text-center text-sm text-gray-400">No video selected</p>
                )}
                <label className="mt-3 inline-block cursor-pointer rounded-lg border border-gray-700 px-3 py-1.5 text-sm font-semibold text-gray-200 hover:bg-gray-800">
                  Change video
                  <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Thumbnail</label>
              <div className="rounded-xl border border-gray-800 bg-black p-3">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="h-48 w-full rounded-lg object-cover" />
                ) : (
                  <p className="py-10 text-center text-sm text-gray-400">No thumbnail selected</p>
                )}
                <label className="mt-3 inline-block cursor-pointer rounded-lg border border-gray-700 px-3 py-1.5 text-sm font-semibold text-gray-200 hover:bg-gray-800">
                  Change thumbnail
                  <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-800 pt-5 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="rounded-lg border border-gray-700 px-4 py-2.5 font-semibold text-gray-200 transition hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 font-semibold text-rose-600 transition hover:bg-rose-100"
              >
                Delete Video
              </button>
            </div>
          </form>
        </section>
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


