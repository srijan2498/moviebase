import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, ExternalLink, CheckCircle, AlertCircle, Clapperboard, Loader } from 'lucide-react';
import { setApiKey as saveApiKey } from '../api/client';
import { getConfiguration } from '../api/tmdb';
import { useAppStore } from '../store/useAppStore';

export default function SetupPage() {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const storeSetApiKey = useAppStore((s) => s.setApiKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true);
    setError('');
    try {
      saveApiKey(key.trim());
      // Validate key by making a real API call
      await getConfiguration();
      storeSetApiKey(key.trim());
    } catch {
      setError('Invalid API key or network error. Please check your TMDB Bearer token and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="setup-page">
      {/* Animated background */}
      <div className="setup-bg">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="setup-bg-orb"
            animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
            style={{
              left: `${(i * 17 + 5) % 100}%`,
              top: `${(i * 23 + 10) % 100}%`,
              width: `${60 + (i % 4) * 40}px`,
              height: `${60 + (i % 4) * 40}px`,
            }}
          />
        ))}
      </div>

      <motion.div
        className="setup-card"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo */}
        <div className="setup-logo">
          <motion.div
            className="setup-logo-icon"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Clapperboard size={36} />
          </motion.div>
          <h1 className="setup-title">CineOrbit</h1>
        </div>

        <p className="setup-subtitle">
          The ultimate movie & TV explorer powered by TMDB
        </p>

        <div className="setup-features">
          {['🎬 10,000+ movies & shows', '📺 Full season/episode browser', '🔍 Smart multi-search', '❤️ Watchlist & favorites'].map((f) => (
            <span key={f} className="setup-feature">{f}</span>
          ))}
        </div>

        <div className="setup-divider" />

        <h2 className="setup-form-title">
          <Key size={18} />
          Enter your TMDB API Key
        </h2>

        <div className="setup-info">
          <p>You need a TMDB API Read Access Token (Bearer token). Get one free at:</p>
          <a
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="setup-info-link"
          >
            themoviedb.org/settings/api <ExternalLink size={12} />
          </a>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="input-icon-wrapper">
            <Key size={16} className="input-icon" />
            <input
              type="text"
              className="input"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiJ9..."
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={!key.trim() || loading}
          >
            {loading ? (
              <><Loader size={18} className="spin" /> Verifying...</>
            ) : (
              <><CheckCircle size={18} /> Start Exploring</>
            )}
          </button>
        </form>

        <p className="setup-note">
          Your API key is stored locally in your browser and never sent to any server.
        </p>
      </motion.div>

      <style>{`
        .setup-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 40px 20px; position: relative; overflow: hidden;
          background: radial-gradient(ellipse at 20% 50%, rgba(1, 180, 228, 0.08) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 60%),
                      var(--bg-primary);
        }
        .setup-bg { position: absolute; inset: 0; pointer-events: none; }
        .setup-bg-orb {
          position: absolute; border-radius: 50%;
          background: radial-gradient(circle, rgba(1, 180, 228, 0.15), transparent);
          filter: blur(20px);
        }
        .setup-card {
          position: relative; z-index: 1; max-width: 520px; width: 100%;
          background: var(--bg-secondary); border: 1px solid var(--border);
          border-radius: var(--radius-xl); padding: 40px;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6), 0 0 80px rgba(1, 180, 228, 0.05);
        }
        .setup-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .setup-logo-icon { color: var(--accent); }
        .setup-title {
          font-family: var(--font-display); font-size: 36px; font-weight: 900;
          background: linear-gradient(135deg, var(--accent), #6366f1);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .setup-subtitle { color: var(--text-secondary); font-size: 16px; margin-bottom: 20px; }
        .setup-features { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
        .setup-feature {
          background: var(--bg-glass-light); border: 1px solid var(--border);
          border-radius: var(--radius-full); padding: 4px 12px; font-size: 13px; color: var(--text-secondary);
        }
        .setup-divider { border: none; border-top: 1px solid var(--border); margin: 24px 0; }
        .setup-form-title {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-display); font-size: 18px; font-weight: 700;
          color: var(--text-primary); margin-bottom: 16px;
        }
        .setup-info { margin-bottom: 20px; color: var(--text-secondary); font-size: 14px; line-height: 1.6; }
        .setup-info-link {
          display: inline-flex; align-items: center; gap: 4px;
          color: var(--accent); font-weight: 600;
          text-decoration: underline; text-underline-offset: 2px;
        }
        .setup-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 16px; }
        .setup-note { color: var(--text-muted); font-size: 12px; text-align: center; margin-top: 8px; }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}
