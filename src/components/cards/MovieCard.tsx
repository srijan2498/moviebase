import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Bookmark, BookmarkCheck, Heart } from 'lucide-react';
import { getPosterUrl } from '../../utils/imageUrl';
import { formatYear, formatRating } from '../../utils/formatters';
import { useAppStore } from '../../store/useAppStore';
import type { Movie } from '../../api/tmdb';

interface MovieCardProps {
  movie: Movie;
  index?: number;
}

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isInFavorites, addToFavorites, removeFromFavorites, showToast } = useAppStore();
  const inWatchlist = isInWatchlist(movie.id, 'movie');
  const inFavorites = isInFavorites(movie.id, 'movie');

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWatchlist) { removeFromWatchlist(movie.id, 'movie'); showToast('Removed from watchlist'); }
    else { addToWatchlist({ ...movie, media_type: 'movie' }); showToast('Added to watchlist'); }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inFavorites) { removeFromFavorites(movie.id, 'movie'); showToast('Removed from favorites'); }
    else { addToFavorites({ ...movie, media_type: 'movie' }); showToast('Added to favorites'); }
  };

  const rating = movie.vote_average;
  const ratingColor = rating >= 7 ? '#10b981' : rating >= 5 ? '#f59e0b' : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link to={`/movie/${movie.id}`} className="media-card">
        <div className="media-card-poster">
          <img
            src={getPosterUrl(movie.poster_path, 'w342')}
            alt={movie.title}
            loading="lazy"
            decoding="async"
            className="media-card-img"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
          />
          <div className="poster-overlay" />

          {/* Rating badge */}
          {rating > 0 && (
            <div className="media-card-rating" style={{ color: ratingColor }}>
              <Star size={10} fill={ratingColor} />
              <span>{formatRating(rating)}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="media-card-actions">
            <button
              className={`media-card-action-btn ${inWatchlist ? 'active' : ''}`}
              onClick={handleWatchlist}
              title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {inWatchlist ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
            <button
              className={`media-card-action-btn ${inFavorites ? 'favorite' : ''}`}
              onClick={handleFavorite}
              title={inFavorites ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={14} fill={inFavorites ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <div className="media-card-info">
          <p className="media-card-title line-clamp-2">{movie.title}</p>
          <p className="media-card-year">{formatYear(movie.release_date)}</p>
        </div>
      </Link>
    </motion.div>
  );
}
