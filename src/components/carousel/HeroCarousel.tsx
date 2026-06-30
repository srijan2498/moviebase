import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { getBackdropUrl, getPosterUrl } from '../../utils/imageUrl';
import { formatRating, formatYear } from '../../utils/formatters';
import type { Movie, TVShow } from '../../api/tmdb';
import { useAppStore } from '../../store/useAppStore';

type HeroItem = (Movie | TVShow) & { media_type?: 'movie' | 'tv' };

interface HeroCarouselProps {
  items: HeroItem[];
}

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const getGenreName = useAppStore((s) => s.getGenreName);

  const go = (idx: number, dir: number) => {
    setDirection(dir);
    setCurrent(idx);
  };
  const prev = () => go((current - 1 + items.length) % items.length, -1);
  const next = () => go((current + 1) % items.length, 1);

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % items.length);
    }, 6000);
  };

  useEffect(() => {
    if (items.length > 1) resetInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [items.length]);

  if (!items.length) return null;

  const item = items[current];
  const isMovie = (item as Movie).title !== undefined;
  const title = isMovie ? (item as Movie).title : (item as TVShow).name;
  const releaseDate = isMovie ? (item as Movie).release_date : (item as TVShow).first_air_date;
  const linkTo = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`;
  const genreIds = item.genre_ids ?? [];

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div className="hero-carousel">
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={item.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="hero-slide"
        >
          {/* Backdrop */}
          <div className="hero-backdrop">
            <img
              src={getBackdropUrl(item.backdrop_path, 'w1280')}
              alt={title}
              decoding="async"
            />
            <div className="hero-backdrop-overlay" />
          </div>

          {/* Content */}
          <div className="hero-content container">
            <div className="hero-content-inner">
              <div className="hero-poster">
                <img
                  src={getPosterUrl(item.poster_path, 'w342')}
                  alt={title}
                  decoding="async"
                />
              </div>
              <div className="hero-meta">
                <div className="hero-badges">
                  <span className="badge badge-accent">
                    {isMovie ? '🎬 Movie' : '📺 TV Show'}
                  </span>
                  {item.vote_average > 0 && (
                    <span className="badge badge-gold">
                      <Star size={10} fill="currentColor" />
                      {formatRating(item.vote_average)}
                    </span>
                  )}
                  {releaseDate && (
                    <span className="badge badge-muted">{formatYear(releaseDate)}</span>
                  )}
                </div>

                <h1 className="hero-title">{title}</h1>

                {genreIds.length > 0 && (
                  <div className="hero-genres">
                    {genreIds.slice(0, 3).map((id) => (
                      <span key={id} className="hero-genre-chip">{getGenreName(id)}</span>
                    ))}
                  </div>
                )}

                <p className="hero-overview line-clamp-3">{item.overview}</p>

                <div className="hero-actions">
                  <Link to={linkTo} className="btn btn-primary btn-lg">
                    <Play size={18} fill="currentColor" />
                    View Details
                  </Link>
                  <Link to={linkTo} className="btn btn-secondary btn-lg">
                    <Info size={18} />
                    More Info
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {items.length > 1 && (
        <>
          <button
            className="hero-arrow hero-arrow-left"
            onClick={() => { prev(); resetInterval(); }}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="hero-arrow hero-arrow-right"
            onClick={() => { next(); resetInterval(); }}
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="hero-dots">
            {items.map((_, i) => (
              <button
                key={i}
                className={`hero-dot ${i === current ? 'active' : ''}`}
                onClick={() => { go(i, i > current ? 1 : -1); resetInterval(); }}
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        .hero-carousel { position: relative; height: 85vh; min-height: 520px; max-height: 700px; overflow: hidden; }
        .hero-slide { position: absolute; inset: 0; }
        .hero-backdrop { position: absolute; inset: 0; }
        .hero-backdrop img { width: 100%; height: 100%; object-fit: cover; }
        .hero-backdrop-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(8,12,24,0.95) 0%, rgba(8,12,24,0.7) 50%, rgba(8,12,24,0.3) 100%),
                      linear-gradient(to top, rgba(8,12,24,0.8) 0%, transparent 40%);
        }
        .hero-content { position: absolute; inset: 0; display: flex; align-items: center; }
        .hero-content-inner { display: flex; align-items: center; gap: 40px; max-width: 900px; }
        .hero-poster {
          flex-shrink: 0; width: 180px; border-radius: var(--radius-xl);
          overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.8);
          border: 2px solid rgba(255,255,255,0.1);
        }
        @media (max-width: 768px) { .hero-poster { display: none; } }
        .hero-poster img { width: 100%; display: block; }
        .hero-meta { flex: 1; }
        .hero-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
        .hero-title {
          font-family: var(--font-display); font-size: clamp(28px, 5vw, 52px); font-weight: 900;
          line-height: 1.1; color: var(--text-primary); margin-bottom: 12px;
          text-shadow: 0 2px 20px rgba(0,0,0,0.8);
        }
        .hero-genres { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
        .hero-genre-chip {
          padding: 4px 12px; border-radius: var(--radius-full);
          font-size: 12px; color: var(--text-secondary); border: 1px solid var(--border);
          background: rgba(255,255,255,0.05);
        }
        .hero-overview { color: var(--text-secondary); font-size: 15px; line-height: 1.7; margin-bottom: 24px; max-width: 600px; }
        .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .hero-arrow {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
          background: rgba(8,12,24,0.7); backdrop-filter: blur(8px);
          border: 1px solid var(--border); border-radius: var(--radius-full);
          width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;
          color: var(--text-primary); transition: all var(--transition); cursor: pointer;
        }
        .hero-arrow:hover { background: var(--accent); border-color: var(--accent); }
        .hero-arrow-left { left: 20px; }
        .hero-arrow-right { right: 20px; }
        .hero-dots { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 10; }
        .hero-dot { width: 8px; height: 8px; border-radius: var(--radius-full); background: rgba(255,255,255,0.3); transition: all var(--transition); cursor: pointer; }
        .hero-dot.active { width: 28px; background: var(--accent); }
      `}</style>
    </div>
  );
}
