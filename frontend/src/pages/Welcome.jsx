import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllVideos } from '../api/api';
import './Home.css';

const PLACEHOLDER_THUMB = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='320' height='180' fill='%23222'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23aaa' font-family='Arial' font-size='16'>Video</text></svg>";
const PLACEHOLDER_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' rx='20' ry='20' fill='%23333'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23bbb' font-family='Arial' font-size='12'>U</text></svg>";

export default function Welcome() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const hasAccessToken = Boolean(parsedUser?.accessToken);

    if (!hasAccessToken) {
      setVideos([]);
      setRequiresLogin(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setRequiresLogin(false);
      const response = await getAllVideos({});
      const videosData = response.data?.data?.docs || response.data?.docs || response.data?.data || [];
      setVideos(Array.isArray(videosData) ? videosData : []);
    } catch (error) {
      if (error.response?.status === 401) {
        setRequiresLogin(true);
      } else {
        console.error('Error fetching videos:', error);
      }
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const searchMatchedVideos = Array.isArray(videos)
    ? videos.filter(
        (video) =>
          video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const sortedVideos = [...searchMatchedVideos].sort((a, b) => {
    if (filter === 'latest') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    if (filter === 'popular' || filter === 'trending') {
      return Number(b.views || 0) - Number(a.views || 0);
    }
    return 0;
  });

  const featuredVideos = sortedVideos.slice(0, 6);

  const featureItems = [
    {
      title: 'Powerful Creator Tools',
      text: 'Upload, edit, and manage your content with professional-grade tools built for creators.',
    },
    {
      title: 'Engaged Community',
      text: 'Connect with viewers who love discovering new voices and supporting creators.',
    },
    {
      title: 'Growth Analytics',
      text: 'Track performance and understand your audience with detailed insights.',
    },
    {
      title: 'Monetization Options',
      text: 'Turn your passion into income with ads, memberships, and fan support.',
    },
    {
      title: 'Personalized Feed',
      text: 'Discover content tailored to your interests with smart recommendations.',
    },
    {
      title: 'Safe Environment',
      text: 'Your privacy and security matter with built-in trust and safety controls.',
    },
  ];

  const footerColumns = [
    {
      title: 'Explore',
      links: ['Trending', 'Categories', 'Live', 'Music'],
    },
    {
      title: 'Creators',
      links: ['Start creating', 'Creator tools', 'Monetization', 'Resources'],
    },
    {
      title: 'Company',
      links: ['About us', 'Careers', 'Press', 'Contact'],
    },
    {
      title: 'Legal',
      links: ['Terms of Service', 'Privacy Policy', 'Community Guidelines', 'Copyright'],
    },
  ];

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-container home-hero-content">
          <p className="home-kicker">WATCH. CREATE. CONNECT.</p>
          <h1>Watch, Create, Connect</h1>
          <p>
            Join millions of creators and viewers sharing their stories through video.
            Discover content you love, build your community, and express yourself.
          </p>
          <div className="home-hero-actions">
            <a href="#trending" className="home-btn home-btn-primary">Start watching</a>
            <Link to="/signup" className="home-btn home-btn-secondary">Become a creator</Link>
          </div>
        </div>
      </section>

      <section id="trending" className="home-section">
        <div className="home-container">
          <div className="home-section-title">
            <p>TRENDING NOW</p>
            <h2>Popular videos today</h2>
          </div>

          <div className="home-toolbar">
            <div className="home-search-wrap">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="home-search"
              />
            </div>
            <div className="home-filters">
              {['all', 'latest', 'popular', 'trending'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`home-filter-chip ${filter === filterOption ? 'is-active' : ''}`}
                >
                  {filterOption}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="home-video-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="home-video-card is-loading" />
              ))}
            </div>
          ) : featuredVideos.length === 0 ? (
            <div className="home-empty-state">
              <h3>No videos found</h3>
              {requiresLogin ? (
                <p>
                  Please <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline">sign in</Link> to view videos.
                </p>
              ) : (
                <p>Try adjusting your search or filters.</p>
              )}
            </div>
          ) : (
            <div className="home-video-grid">
              {featuredVideos.map((video) => (
                <Link key={video._id} to={`/video/${video._id}`} className="home-video-card">
                  <div className="home-video-thumb-wrap">
                    <img
                      src={video.thumbnail || PLACEHOLDER_THUMB}
                      alt={video.title || 'Video thumbnail'}
                      className="home-video-thumb"
                    />
                    <span className="home-video-duration">{formatDuration(video.duration)}</span>
                  </div>
                  <div className="home-video-body">
                    <h3>{video.title || 'Untitled Video'}</h3>
                    <div className="home-video-owner">
                      <img
                        src={video.owner?.avatar || PLACEHOLDER_AVATAR}
                        alt={video.owner?.username || 'Creator avatar'}
                      />
                      <div>
                        <p>{video.owner?.username || 'Unknown creator'}</p>
                        <span>{video.views || 0} views • {new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="home-section home-section-alt">
        <div className="home-container">
          <div className="home-section-title">
            <p>WHY CHOOSE US</p>
            <h2>Everything you need to create and share</h2>
          </div>
          <div className="home-feature-grid">
            {featureItems.map((item) => (
              <article key={item.title} className="home-feature-card">
                <div className="home-feature-icon" aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="home-container home-cta-content">
          <h2>Ready to start your journey?</h2>
          <div className="home-hero-actions">
            <a href="#trending" className="home-btn home-btn-secondary">Explore videos</a>
            <Link to="/signup" className="home-btn home-btn-primary">Create account</Link>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-container home-footer-grid">
          <div className="home-footer-brand">
            <h3>VideoHub</h3>
            <p>Share your story with the world.</p>
          </div>
          <div className="home-footer-links-wrap">
            {footerColumns.map((column) => (
              <div key={column.title} className="home-footer-col">
                <h4>{column.title}</h4>
                {column.links.map((label) => (
                  <a key={label} href="#">{label}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

