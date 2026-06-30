import { Link } from 'react-router-dom';
import { Clapperboard, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <Clapperboard size={18} />
              <span>CineVerse</span>
            </Link>
            <p className="footer-tagline">
              Powered by <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="footer-tmdb-link">TMDB</a>
            </p>
            <img
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
              alt="TMDB Logo"
              className="footer-tmdb-logo"
            />
          </div>
          <div className="footer-links-group">
            <h4>Discover</h4>
            <ul>
              <li><Link to="/movies">Movies</Link></li>
              <li><Link to="/tv">TV Shows</Link></li>
              <li><Link to="/people">People</Link></li>
            </ul>
          </div>
          <div className="footer-links-group">
            <h4>My Space</h4>
            <ul>
              <li><Link to="/watchlist">Watchlist</Link></li>
              <li><Link to="/watchlist?tab=favorites">Favorites</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">
            Made with <Heart size={12} className="footer-heart" /> using TMDB API. This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
      <style>{`
        .footer {
          background: var(--bg-secondary); border-top: 1px solid var(--border);
          padding: 48px 0 24px;
        }
        .footer-inner {
          display: grid; grid-template-columns: 1fr; gap: 32px;
        }
        @media (min-width: 640px) { .footer-inner { grid-template-columns: 2fr 1fr 1fr; } }
        .footer-logo {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-display); font-size: 18px; font-weight: 800;
          background: linear-gradient(135deg, var(--accent), #6366f1);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .footer-tagline { color: var(--text-muted); font-size: 13px; margin-top: 8px; }
        .footer-tmdb-link { color: var(--accent); }
        .footer-tmdb-logo { height: 20px; margin-top: 12px; opacity: 0.7; }
        .footer-links-group h4 {
          font-family: var(--font-display); font-size: 14px; font-weight: 700;
          color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .footer-links-group ul { display: flex; flex-direction: column; gap: 8px; }
        .footer-links-group a { color: var(--text-muted); font-size: 14px; transition: color var(--transition); }
        .footer-links-group a:hover { color: var(--accent); }
        .footer-bottom { border-top: 1px solid var(--border); margin-top: 32px; padding-top: 20px; }
        .footer-copy { color: var(--text-muted); font-size: 12px; display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
        .footer-heart { color: var(--danger); display: inline; }
      `}</style>
    </footer>
  );
}
