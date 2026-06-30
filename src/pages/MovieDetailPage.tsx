import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Play, Bookmark, BookmarkCheck, Heart, Clock, Calendar, DollarSign, Globe, Image, Video, Award } from 'lucide-react';
import { getMovieDetails } from '../api/tmdb';
import type { Movie, Video as TMDBVideo, Image as TMDBImage, Review, Cast } from '../api/tmdb';
import { getBackdropUrl, getPosterUrl, getProfileUrl } from '../utils/imageUrl';
import { formatDate, formatRuntime, formatMoney, formatRating } from '../utils/formatters';
import { useAppStore } from '../store/useAppStore';
import HorizontalScroll from '../components/carousel/HorizontalScroll';
import MovieCard from '../components/cards/MovieCard';

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMediaTab, setActiveMediaTab] = useState<'videos' | 'images'>('videos');
  const [selectedTrailer, setSelectedTrailer] = useState<TMDBVideo | null>(null);

  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isInFavorites, addToFavorites, removeFromFavorites, showToast } = useAppStore();

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getMovieDetails(parseInt(id));
        setMovie(data);
      } catch (err) {
        setError('Failed to load movie details.');
      } finally {
        setLoading(false);
      }
    }
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) return <div className="page loading-center"><div className="spinner spinner-lg" /></div>;
  if (error || !movie) return <div className="page container mt-8"><div className="error-banner"><span>{error || 'Movie not found'}</span></div></div>;

  const inWatchlist = isInWatchlist(movie.id, 'movie');
  const inFavorites = isInFavorites(movie.id, 'movie');

  const handleWatchlist = () => {
    if (inWatchlist) { removeFromWatchlist(movie.id, 'movie'); showToast('Removed from watchlist'); }
    else { addToWatchlist({ ...movie, media_type: 'movie' }); showToast('Added to watchlist'); }
  };

  const handleFavorite = () => {
    if (inFavorites) { removeFromFavorites(movie.id, 'movie'); showToast('Removed from favorites'); }
    else { addToFavorites({ ...movie, media_type: 'movie' }); showToast('Added to favorites'); }
  };

  // Extract relations from appended responses
  const appData = movie as unknown as {
    credits?: { cast: Cast[] };
    videos?: { results: TMDBVideo[] };
    images?: { backdrops: TMDBImage[] };
    similar?: { results: Movie[] };
    recommendations?: { results: Movie[] };
    reviews?: { results: Review[] };
    external_ids?: { imdb_id?: string };
    keywords?: { keywords: { id: number; name: string }[] };
    'watch/providers'?: { results?: Record<string, { link: string; flatrate?: { logo_path: string; provider_name: string }[] }> };
  };

  const cast = appData.credits?.cast.slice(0, 12) || [];
  const videos = appData.videos?.results.filter((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || [];
  const backdrops = appData.images?.backdrops.slice(0, 10) || [];
  const recommendations = appData.recommendations?.results || [];
  const reviews = appData.reviews?.results.slice(0, 3) || [];
  const imdbId = appData.external_ids?.imdb_id;
  const keywords = appData.keywords?.keywords || [];
  
  // Watch providers for US or international
  const providers = appData['watch/providers']?.results?.US?.flatrate || appData['watch/providers']?.results?.IN?.flatrate || [];

  return (
    <div className="page" style={{ paddingBottom: 60 }}>
      {/* Hero Backdrop Banner */}
      <div className="detail-hero">
        <div className="detail-hero-backdrop">
          <img src={getBackdropUrl(movie.backdrop_path, 'w1280')} alt={movie.title} />
          <div className="detail-hero-overlay" />
        </div>

        <div className="container detail-hero-content">
          <div className="detail-poster hide-mobile">
            <img src={getPosterUrl(movie.poster_path, 'w342')} alt={movie.title} />
          </div>

          <div className="detail-meta">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="badge badge-accent">Movie</span>
              {movie.vote_average > 0 && (
                <span className="badge badge-gold">
                  <Star size={10} fill="currentColor" />
                  {formatRating(movie.vote_average)}
                </span>
              )}
              {movie.status && <span className="badge badge-muted">{movie.status}</span>}
            </div>

            <h1 className="detail-title">{movie.title}</h1>
            {movie.tagline && <p className="detail-tagline">"{movie.tagline}"</p>}

            <div className="detail-quick-stats">
              <div className="stat-item"><Calendar size={14} /> <span>{formatDate(movie.release_date)}</span></div>
              {movie.runtime && <div className="stat-item"><Clock size={14} /> <span>{formatRuntime(movie.runtime)}</span></div>}
            </div>

            <p className="detail-overview">{movie.overview}</p>

            <div className="detail-actions">
              {videos.length > 0 && (
                <button className="btn btn-primary" onClick={() => setSelectedTrailer(videos[0])}>
                  <Play size={16} fill="currentColor" /> Watch Trailer
                </button>
              )}
              <button className={`btn btn-secondary ${inWatchlist ? 'active' : ''}`} onClick={handleWatchlist}>
                {inWatchlist ? <BookmarkCheck size={16} /> : <Bookmark size={16} />} Watchlist
              </button>
              <button className="btn btn-secondary" onClick={handleFavorite}>
                <Heart size={16} fill={inFavorites ? '#ef4444' : 'none'} style={{ color: inFavorites ? '#ef4444' : 'inherit' }} /> Like
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-8">
        <div className="detail-grid">
          {/* Left Column: Main Details */}
          <div className="detail-main">
            {/* Cast section */}
            {cast.length > 0 && (
              <div className="detail-section">
                <h3 className="section-title mb-4"><span className="accent-dot" />Cast & Credits</h3>
                <div className="h-scroll-track" style={{ gap: 12 }}>
                  {cast.map((member) => (
                    <Link to={`/person/${member.id}`} key={member.credit_id} className="cast-card">
                      <div className="cast-card-photo">
                        <img src={getProfileUrl(member.profile_path, 'w185')} alt={member.name} />
                      </div>
                      <div className="cast-card-info">
                        <p className="cast-card-name line-clamp-1">{member.name}</p>
                        <p className="cast-card-role line-clamp-1">{member.character}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Media Tabs (Videos/Images) */}
            {(videos.length > 0 || backdrops.length > 0) && (
              <div className="detail-section mt-6">
                <div className="tabs mb-4">
                  {videos.length > 0 && (
                    <button className={`tab ${activeMediaTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveMediaTab('videos')}>
                      <Video size={14} style={{ marginRight: 4 }} /> Videos ({videos.length})
                    </button>
                  )}
                  {backdrops.length > 0 && (
                    <button className={`tab ${activeMediaTab === 'images' ? 'active' : ''}`} onClick={() => setActiveMediaTab('images')}>
                      <Image size={14} style={{ marginRight: 4 }} /> Images ({backdrops.length})
                    </button>
                  )}
                </div>

                {activeMediaTab === 'videos' && videos.length > 0 && (
                  <div className="h-scroll-track" style={{ gap: 16 }}>
                    {videos.map((vid) => (
                      <div key={vid.id} className="video-card" onClick={() => setSelectedTrailer(vid)}>
                        <div className="video-card-thumb">
                          <img src={`https://img.youtube.com/vi/${vid.key}/mqdefault.jpg`} alt={vid.name} />
                          <div className="play-overlay"><Play size={24} fill="currentColor" /></div>
                        </div>
                        <p className="video-card-title line-clamp-1">{vid.name}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeMediaTab === 'images' && backdrops.length > 0 && (
                  <div className="h-scroll-track" style={{ gap: 12 }}>
                    {backdrops.map((img, i) => (
                      <div key={i} className="gallery-img-container">
                        <img src={getBackdropUrl(img.file_path, 'w780')} alt="backdrop" className="gallery-img" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div className="detail-section mt-8">
                <h3 className="section-title mb-4"><span className="accent-dot" />Reviews</h3>
                <div className="reviews-list">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="review-item">
                      <div className="review-header">
                        <span className="review-author">{rev.author}</span>
                        {rev.author_details?.rating && (
                          <span className="badge badge-gold">★ {rev.author_details.rating}</span>
                        )}
                      </div>
                      <p className="review-content line-clamp-3">{rev.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar/Recommendations */}
            {recommendations.length > 0 && (
              <div className="mt-8">
                <HorizontalScroll title="Recommended Movies">
                  {recommendations.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
                </HorizontalScroll>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar Specs */}
          <div className="detail-side">
            <div className="side-card">
              <h4 className="side-card-title">Information</h4>
              
              {providers.length > 0 && (
                <div className="info-block">
                  <span className="info-label">Streaming On</span>
                  <div className="providers-list mt-2">
                    {providers.map((p, i) => (
                      <img key={i} src={`https://image.tmdb.org/t/p/w45${p.logo_path}`} title={p.provider_name} alt={p.provider_name} className="provider-logo" />
                    ))}
                  </div>
                </div>
              )}

              {movie.budget ? (
                <div className="info-block">
                  <span className="info-label">Budget</span>
                  <span className="info-value"><DollarSign size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />{formatMoney(movie.budget)}</span>
                </div>
              ) : null}

              {movie.revenue ? (
                <div className="info-block">
                  <span className="info-label">Revenue</span>
                  <span className="info-value"><DollarSign size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />{formatMoney(movie.revenue)}</span>
                </div>
              ) : null}

              {movie.belongs_to_collection && (
                <div className="info-block">
                  <span className="info-label">Part of Collection</span>
                  <Link to={`/collection/${movie.belongs_to_collection.id}`} className="info-value text-accent underline">
                    {movie.belongs_to_collection.name}
                  </Link>
                </div>
              )}

              {imdbId || movie.homepage ? (
                <div className="info-block">
                  <span className="info-label">Links</span>
                  <div className="flex gap-3 mt-2">
                    {movie.homepage && (
                      <a href={movie.homepage} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><Globe size={12} /> Website</a>
                    )}
                    {imdbId && (
                      <a href={`https://www.imdb.com/title/${imdbId}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><Award size={12} /> IMDb</a>
                    )}
                  </div>
                </div>
              ) : null}

              {keywords.length > 0 && (
                <div className="info-block">
                  <span className="info-label">Keywords</span>
                  <div className="tag-list mt-2">
                    {keywords.slice(0, 10).map((k) => (
                      <span key={k.id} className="tag">{k.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Lightbox Modal */}
      {selectedTrailer && (
        <div className="modal-overlay" onClick={() => setSelectedTrailer(null)}>
          <div className="modal-content" style={{ maxWidth: '800px', background: '#000', borderRadius: '12px', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTrailer(null)}>&times;</button>
            <div className="iframe-container">
              <iframe
                title={selectedTrailer.name}
                src={`https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .detail-hero { position: relative; min-height: 50vh; display: flex; align-items: flex-end; padding: 48px 0; overflow: hidden; }
        .detail-hero-backdrop { position: absolute; inset: 0; z-index: 0; }
        .detail-hero-backdrop img { width: 100%; height: 100%; object-fit: cover; }
        .detail-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, var(--bg-primary) 0%, rgba(8,12,24,0.85) 60%, rgba(8,12,24,0.4) 100%);
        }
        .detail-hero-content { position: relative; z-index: 1; display: flex; gap: 40px; }
        .detail-poster { width: 220px; border-radius: var(--radius-xl); overflow: hidden; box-shadow: var(--shadow-lg); border: 2px solid rgba(255,255,255,0.1); flex-shrink: 0; }
        .detail-poster img { width: 100%; display: block; }
        .detail-meta { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; }
        .detail-title { font-family: var(--font-display); font-size: clamp(24px, 4vw, 44px); font-weight: 900; line-height: 1.1; margin-bottom: 8px; }
        .detail-tagline { font-size: 15px; color: var(--text-secondary); font-style: italic; margin-bottom: 12px; }
        .detail-quick-stats { display: flex; gap: 16px; margin-bottom: 16px; color: var(--text-muted); font-size: 13px; }
        .stat-item { display: flex; align-items: center; gap: 6px; }
        .detail-overview { font-size: 15px; line-height: 1.7; color: var(--text-secondary); margin-bottom: 24px; max-width: 800px; }
        .detail-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .detail-grid { display: grid; grid-template-columns: 1fr; gap: 32px; }
        @media (min-width: 1024px) { .detail-grid { grid-template-columns: 3fr 1fr; } }
        .side-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 24px; }
        .side-card-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; margin-bottom: 18px; }
        .info-block { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
        .info-block:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
        .info-label { font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600; letter-spacing: 0.05em; }
        .info-value { font-size: 14px; color: var(--text-primary); font-weight: 500; }
        .providers-list { display: flex; gap: 8px; flex-wrap: wrap; }
        .provider-logo { width: 36px; height: 36px; border-radius: var(--radius-sm); }
        .video-card { width: 220px; flex-shrink: 0; cursor: pointer; }
        .video-card-thumb { position: relative; aspect-ratio: 16/9; border-radius: var(--radius-md); overflow: hidden; background: var(--bg-card); }
        .video-card-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .play-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); opacity: 0; transition: opacity var(--transition); color: var(--accent); }
        .video-card:hover .play-overlay { opacity: 1; }
        .video-card-title { font-size: 12px; margin-top: 6px; font-weight: 500; }
        .gallery-img-container { width: 280px; flex-shrink: 0; aspect-ratio: 16/9; border-radius: var(--radius-md); overflow: hidden; }
        .gallery-img { width: 100%; height: 100%; object-fit: cover; }
        .reviews-list { display: flex; flex-direction: column; gap: 16px; }
        .review-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 18px; }
        .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .review-author { font-weight: 600; font-size: 14px; }
        .review-content { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
        .iframe-container { position: relative; width: 100%; padding-bottom: 56.25%; height: 0; }
        .iframe-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .underline { text-decoration: underline; }
      `}</style>
    </div>
  );
}
