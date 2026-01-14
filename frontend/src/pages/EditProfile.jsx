import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserAvatar, updateUserCoverImage, updateAccountDetails } from '../api/api';

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Load user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    setFormData({
      fullName: userData.fullname || '',
      email: userData.email || ''
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
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    // Validation
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

    if (!avatarFile && !coverFile && formData.fullName === user.fullname && formData.email === user.email) {
      setError('Please make changes to your profile');
      return;
    }

    try {
      setLoading(true);

      // Update account details (fullname and email)
      if (formData.fullName !== user.fullname || formData.email !== user.email) {
        await updateAccountDetails({
          fullname: formData.fullName,
          email: formData.email
        });
      }

      // Update avatar if selected
      if (avatarFile) {
        const formDataAvatar = new FormData();
        formDataAvatar.append('avatar', avatarFile);
        await updateUserAvatar(formDataAvatar);
      }

      // Update cover image if selected
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Edit Profile</h1>
            <p className="text-gray-400">Update your profile information, avatar and cover image</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Full Name */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-4">
                Avatar
              </label>
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full border-2 border-gray-600 overflow-hidden bg-gray-700 flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <label className="cursor-pointer">
                  <div className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200">
                    Choose Avatar
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                {avatarFile && (
                  <p className="text-gray-400 text-sm">{avatarFile.name}</p>
                )}
              </div>
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-4">
                Cover Image
              </label>
              <div className="flex flex-col items-center gap-4">
                <div className="w-full h-40 rounded-lg border-2 border-gray-600 overflow-hidden bg-gray-700 flex items-center justify-center">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  )}
                </div>
                <label className="cursor-pointer">
                  <div className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200">
                    Choose Cover Image
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>
                {coverFile && (
                  <p className="text-gray-400 text-sm">{coverFile.name}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating Profile...' : 'Update Profile'}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition duration-200"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
