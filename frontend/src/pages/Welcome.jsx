import { Link } from 'react-router-dom';

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white">StreamStack</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-white hover:text-purple-300 transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 animate-fade-in">
              Share Your Story
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                With The World
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join millions of creators sharing their passion, building communities, and making an impact through video content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-2xl"
              >
                Start Creating Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-semibold rounded-full border-2 border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Everything You Need</h2>
          <p className="text-gray-400 text-lg">Powerful tools to grow your channel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Upload & Share</h3>
            <p className="text-gray-400">
              Upload videos instantly with our fast and reliable platform. Share your content with millions of viewers.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Track Analytics</h3>
            <p className="text-gray-400">
              Get detailed insights about your audience, views, engagement, and channel growth with our analytics dashboard.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Build Community</h3>
            <p className="text-gray-400">
              Engage with your audience through comments, tweets, and playlists. Build a loyal community around your content.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white/5 backdrop-blur-sm border-y border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                10M+
              </div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                50M+
              </div>
              <div className="text-gray-400">Videos Uploaded</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-400 mb-2">
                1B+
              </div>
              <div className="text-gray-400">Views Daily</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
                190+
              </div>
              <div className="text-gray-400">Countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join our community of creators today. It's free and takes less than a minute.
            </p>
            <Link
              to="/signup"
              className="inline-block px-10 py-4 bg-white text-purple-600 text-lg font-bold rounded-full hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-2xl"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2026 VideoHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
