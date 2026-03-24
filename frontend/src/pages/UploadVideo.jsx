import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { publishVideo } from '../api/api';

export default function UploadVideo() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [files, setFiles] = useState({
    videoFile: null,
    thumbnail: null,
  });
  const [previews, setPreviews] = useState({
    videoFile: null,
    thumbnail: null,
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];

    if (file) {
      setFiles((prev) => ({ ...prev, [name]: file }));

      if (name === 'videoFile') {
        setPreviews((prev) => ({ ...prev, videoFile: URL.createObjectURL(file) }));
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => ({ ...prev, thumbnail: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!files.videoFile || !files.thumbnail) {
      setError('Both video and thumbnail are required');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('videoFile', files.videoFile);
      data.append('thumbnail', files.thumbnail);

      await publishVideo(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight text-white">Upload Video</h1>
          <p className="mt-1 text-sm text-gray-400">Share your content with your audience</p>
          <div className="mt-5 h-px w-full bg-slate-200" />

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Video File <span className="text-rose-600">*</span>
              </label>
              {previews.videoFile ? (
                <div className="rounded-xl border border-gray-800 bg-black p-3">
                  <video src={previews.videoFile} controls className="h-64 w-full rounded-lg bg-black" />
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-300">
                    <span>
                      {files.videoFile?.name} ({((files.videoFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFiles((prev) => ({ ...prev, videoFile: null }));
                        setPreviews((prev) => ({ ...prev, videoFile: null }));
                      }}
                      className="rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 bg-black text-center transition hover:border-emerald-400 hover:bg-emerald-50/40">
                  <svg className="mb-3 h-12 w-12 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-200">Click to upload or drag and drop</p>
                  <p className="mt-1 text-xs text-gray-400">MP4, WebM, or OGG (max 500MB)</p>
                  <input type="file" name="videoFile" accept="video/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Thumbnail <span className="text-rose-600">*</span>
              </label>
              {previews.thumbnail ? (
                <div className="rounded-xl border border-gray-800 bg-black p-3">
                  <img src={previews.thumbnail} alt="Thumbnail preview" className="h-48 w-full rounded-lg object-cover" />
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setFiles((prev) => ({ ...prev, thumbnail: null }));
                        setPreviews((prev) => ({ ...prev, thumbnail: null }));
                      }}
                      className="rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 bg-black text-center transition hover:border-emerald-400 hover:bg-emerald-50/40">
                  <svg className="mb-3 h-10 w-10 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-gray-200">Click to upload thumbnail</p>
                  <p className="mt-1 text-xs text-gray-400">PNG, JPG, or GIF (max 5MB)</p>
                  <input type="file" name="thumbnail" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>

            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-200">
                Title <span className="text-rose-600">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={100}
                value={formData.title}
                onChange={handleChange}
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
                rows="4"
                maxLength={5000}
                value={formData.description}
                onChange={handleChange}
                className="block w-full resize-none rounded-lg border border-gray-700 px-4 py-2.5 text-gray-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Tell viewers about your video"
              />
              <p className="mt-1 text-xs text-gray-400">{formData.description.length}/5000</p>
            </div>

            {loading && uploadProgress > 0 && (
              <div>
                <div className="mb-2 flex justify-between text-sm text-gray-400">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-emerald-600 transition-all" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg border border-gray-700 px-4 py-2.5 font-semibold text-gray-200 transition hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Publish Video'}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6 text-gray-200">
          <h3 className="mb-2 text-base font-semibold text-sky-800">Tips for better engagement</h3>
          <ul className="space-y-1.5 text-sm">
            <li>- Create an eye-catching thumbnail that represents your content</li>
            <li>- Write a clear, descriptive title with useful keywords</li>
            <li>- Include a detailed description with timestamps and links</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


