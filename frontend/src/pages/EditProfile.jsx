import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserAvatar, updateUserCoverImage, updateAccountDetails } from '../api/api';

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    setFormData({
      fullName: userData.fullname || '',
      email: userData.email || '',
    });
    if (userData.avatar) {
      setAvatarPreview(userData.avatar);
    }
    if (userData.coverImage) {
      setCoverPreview(userData.coverImage);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (
      !avatarFile &&
      !coverFile &&
      formData.fullName === user?.fullname &&
      formData.email === user?.email
    ) {
      setError('Please make changes to your profile');
      return;
    }

    try {
      setLoading(true);

      if (formData.fullName !== user?.fullname || formData.email !== user?.email) {
        await updateAccountDetails({
          fullname: formData.fullName,
          email: formData.email,
        });
      }

      if (avatarFile) {
        const formDataAvatar = new FormData();
        formDataAvatar.append('avatar', avatarFile);
        await updateUserAvatar(formDataAvatar);
      }

      if (coverFile) {
        const formDataCover = new FormData();
        formDataCover.append('coverImage', coverFile);
        await updateUserCoverImage(formDataCover);
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-700 border-t-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
            <p className="mt-1 text-sm text-gray-400">Update your details, avatar, and cover image</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-400">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-gray-700 px-4 py-2.5 text-gray-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-gray-700 px-4 py-2.5 text-gray-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Avatar</label>
              <div className="rounded-xl border border-gray-800 bg-black p-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-gray-700 bg-gray-900">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                    ) : (
                      <svg className="h-10 w-10 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <label className="cursor-pointer rounded-lg border border-gray-700 px-3 py-1.5 text-sm font-semibold text-gray-200 hover:bg-gray-800">
                    Choose avatar
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                  {avatarFile && <p className="text-xs text-gray-400">{avatarFile.name}</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Cover Image</label>
              <div className="rounded-xl border border-gray-800 bg-black p-4">
                <div className="h-40 overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <svg className="h-12 w-12 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                  )}
                </div>
                <label className="mt-3 inline-block cursor-pointer rounded-lg border border-gray-700 px-3 py-1.5 text-sm font-semibold text-gray-200 hover:bg-gray-800">
                  Choose cover image
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
                {coverFile && <p className="mt-2 text-xs text-gray-400">{coverFile.name}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Updating Profile...' : 'Update Profile'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="rounded-lg border border-gray-700 px-4 py-2.5 font-semibold text-gray-200 transition hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


