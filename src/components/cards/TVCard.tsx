import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Bookmark, BookmarkCheck, Heart } from 'lucide-react';
import { getPosterUrl } from '../../utils/imageUrl';
import { formatYear, formatRating } from '../../utils/formatters';
import { useAppStore } from '../../store/useAppStore';
import type { TVShow } from '../../api/tmdb';

interface TVCardProps { show: TVShow; index?: number; }

export default function TVCard({ show, index = 0 }: TVCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isInFavorites, addToFavorites, removeFromFavorites, showToast } = useAppStore();
  const inWatchlist = isInWatchlist(show.id, 'tv');
  const inFavorites = isInFavorites(show.id, 'tv');

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWatchlist) { removeFromWatchlist(show.id, 'tv'); showToast('Removed from watchlist'); }
    else { addToWatchlist({ ...show, media_type: 'tv' }); showToast('Added to watchlist'); }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inFavorites) { removeFromFavorites(show.id, 'tv'); showToast('Removed from favorites'); }
    else { addToFavorites({ ...show, media_type: 'tv' }); showToast('Added to favorites'); }
  };

  const rating = show.vote_average;
  const ratingColor = rating >= 7 ? '#10b981' : rating >= 5 ? '#f59e0b' : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link to={`/tv/${show.id}`} className="media-card">
        <div className="media-card-poster">
          <img
            src={getPosterUrl(show.poster_path, 'w342')}
            alt={show.name}
            loading="lazy"
            decoding="async"
            className="media-card-img"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          />
          <div className="poster-overlay" />
          {rating > 0 && (
            <div className="media-card-rating" style={{ color: ratingColor }}>
              <Star size={10} fill={ratingColor} />
              <span>{formatRating(rating)}</span>
            </div>
          )}
          <div className="media-card-actions">
            <button
              className={`media-card-action-btn ${inWatchlist ? 'active' : ''}`}
              onClick={handleWatchlist}
            >
              {inWatchlist ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
            <button
              className={`media-card-action-btn ${inFavorites ? 'favorite' : ''}`}
              onClick={handleFavorite}
            >
              <Heart size={14} fill={inFavorites ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        <div className="media-card-info">
          <p className="media-card-title line-clamp-2">{show.name}</p>
          <p className="media-card-year">{formatYear(show.first_air_date)}</p>
        </div>
      </Link>
    </motion.div>
  );
}
