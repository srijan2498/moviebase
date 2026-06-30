import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Film, Tv, Users, BookmarkPlus, Home, X, Menu, Clapperboard } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const apiKey = useAppStore((s) => s.apiKey);

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home size={16} /> },
    { to: '/movies', label: 'Movies', icon: <Film size={16} /> },
    { to: '/tv', label: 'TV Shows', icon: <Tv size={16} /> },
    { to: '/people', label: 'People', icon: <Users size={16} /> },
    { to: '/watchlist', label: 'Watchlist', icon: <BookmarkPlus size={16} /> },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (!apiKey) return null;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <Clapperboard size={22} className="navbar-logo-icon" />
            <span className="navbar-logo-text">CineOrbit</span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="navbar-links hide-mobile">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="navbar-actions">
            <button className="btn btn-ghost btn-icon" onClick={openSearch} aria-label="Search">
              <Search size={20} />
            </button>
            <button className="btn btn-ghost btn-icon hide-desktop" onClick={() => setMenuOpen(true)}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              className="search-modal"
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="search-modal-form">
                <Search size={20} className="search-modal-icon" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search movies, TV shows, people..."
                  className="search-modal-input"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="search-modal-clear">
                    <X size={16} />
                  </button>
                )}
              </form>
              <p className="search-modal-hint">Press Enter to search • Esc to close</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-menu-header">
                <span className="navbar-logo-text">CineOrbit</span>
                <button onClick={() => setMenuOpen(false)} className="btn btn-ghost btn-icon">
                  <X size={20} />
                </button>
              </div>
              <ul className="mobile-menu-links">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className={`mobile-menu-link ${location.pathname === link.to ? 'active' : ''}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50; height: var(--nav-height);
          background: var(--bg-glass); backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .navbar-inner {
          height: 100%; max-width: 1400px; margin: 0 auto; padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 20px;
        }
        .navbar-logo {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-display); font-size: 20px; font-weight: 800;
          color: var(--text-primary); text-decoration: none;
        }
        .navbar-logo-icon { color: var(--accent); }
        .navbar-logo-text {
          background: linear-gradient(135deg, var(--accent), #6366f1);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .navbar-links { display: flex; align-items: center; gap: 4px; }
        .navbar-link {
          display: flex; align-items: center; gap: 6px; padding: 8px 14px;
          border-radius: var(--radius-md); font-size: 14px; font-weight: 500;
          color: var(--text-secondary); transition: all var(--transition);
        }
        .navbar-link:hover { color: var(--text-primary); background: var(--bg-glass-light); }
        .navbar-link.active { color: var(--accent); background: var(--accent-glow); }
        .navbar-actions { display: flex; align-items: center; gap: 8px; }
        .search-modal {
          background: var(--bg-secondary); border: 1px solid var(--border);
          border-radius: var(--radius-xl); padding: 20px; width: 100%; max-width: 600px;
        }
        .search-modal-form {
          display: flex; align-items: center; gap: 12px;
          background: var(--bg-card); border: 1px solid var(--border-hover);
          border-radius: var(--radius-lg); padding: 12px 16px;
        }
        .search-modal-icon { color: var(--text-muted); flex-shrink: 0; }
        .search-modal-input {
          flex: 1; background: none; border: none; outline: none;
          color: var(--text-primary); font-size: 16px;
        }
        .search-modal-input::placeholder { color: var(--text-muted); }
        .search-modal-clear { color: var(--text-muted); transition: color var(--transition); }
        .search-modal-clear:hover { color: var(--text-primary); }
        .search-modal-hint { color: var(--text-muted); font-size: 12px; margin-top: 10px; text-align: center; }
        .mobile-menu-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); }
        .mobile-menu {
          position: absolute; right: 0; top: 0; bottom: 0; width: 280px;
          background: var(--bg-secondary); border-left: 1px solid var(--border); padding: 20px;
        }
        .mobile-menu-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .mobile-menu-links { display: flex; flex-direction: column; gap: 4px; }
        .mobile-menu-link {
          display: flex; align-items: center; gap: 12px; padding: 12px 16px;
          border-radius: var(--radius-md); color: var(--text-secondary);
          font-size: 15px; font-weight: 500; transition: all var(--transition);
        }
        .mobile-menu-link:hover { color: var(--text-primary); background: var(--bg-glass-light); }
        .mobile-menu-link.active { color: var(--accent); background: var(--accent-glow); }
      `}</style>
    </>
  );
}
