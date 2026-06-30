import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Play, Bookmark, BookmarkCheck, Heart, Calendar, Globe, Award, Tv } from 'lucide-react';
import { getTVDetails, getTVSeasonDetails } from '../api/tmdb';
import type { TVShow, TVSeason, Video as TMDBVideo, Cast } from '../api/tmdb';
import { getBackdropUrl, getPosterUrl, getProfileUrl, getStillUrl } from '../utils/imageUrl';
import { formatDate, formatRating } from '../utils/formatters';
import { useAppStore } from '../store/useAppStore';
import HorizontalScroll from '../components/carousel/HorizontalScroll';
import TVCard from '../components/cards/TVCard';

export default function TVDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [show, setShow] = useState<TVShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeasonNum, setSelectedSeasonNum] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<TVSeason | null>(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState<TMDBVideo | null>(null);

  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isInFavorites, addToFavorites, removeFromFavorites, showToast } = useAppStore();

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getTVDetails(parseInt(id));
        setShow(data);
        if (data.seasons && data.seasons.length > 0) {
          const firstSeason = data.seasons[0].season_number;
          setSelectedSeasonNum(firstSeason);
        }
      } catch (err) {
        setError('Failed to load TV show details.');
      } finally {
        setLoading(false);
      }
    }
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Load Season Details when selection changes
  useEffect(() => {
    async function loadSeason() {
      if (!id || selectedSeasonNum === undefined) return;
      setSeasonLoading(true);
      try {
        const data = await getTVSeasonDetails(parseInt(id), selectedSeasonNum);
        setSeasonDetails(data);
      } catch {
        setSeasonDetails(null);
      } finally {
        setSeasonLoading(false);
      }
    }
    loadSeason();
  }, [id, selectedSeasonNum]);

  if (loading) return <div className="page loading-center"><div className="spinner spinner-lg" /></div>;
  if (error || !show) return <div className="page container mt-8"><div className="error-banner"><span>{error || 'Show not found'}</span></div></div>;

  const inWatchlist = isInWatchlist(show.id, 'tv');
  const inFavorites = isInFavorites(show.id, 'tv');

  const handleWatchlist = () => {
    if (inWatchlist) { removeFromWatchlist(show.id, 'tv'); showToast('Removed from watchlist'); }
    else { addToWatchlist({ ...show, media_type: 'tv' }); showToast('Added to watchlist'); }
  };

  const handleFavorite = () => {
    if (inFavorites) { removeFromFavorites(show.id, 'tv'); showToast('Removed from favorites'); }
    else { addToFavorites({ ...show, media_type: 'tv' }); showToast('Added to favorites'); }
  };

  const appData = show as unknown as {
    credits?: { cast: Cast[] };
    videos?: { results: TMDBVideo[] };
    recommendations?: { results: TVShow[] };
    external_ids?: { imdb_id?: string };
    keywords?: { results: { id: number; name: string }[] };
    'watch/providers'?: { results?: Record<string, { link: string; flatrate?: { logo_path: string; provider_name: string }[] }> };
  };

  const cast = appData.credits?.cast.slice(0, 12) || [];
  const videos = appData.videos?.results.filter((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || [];
  const recommendations = appData.recommendations?.results || [];
  const imdbId = appData.external_ids?.imdb_id;
  const keywords = appData.keywords?.results || [];
  const providers = appData['watch/providers']?.results?.US?.flatrate || appData['watch/providers']?.results?.IN?.flatrate || [];

  return (
    <div className="page" style={{ paddingBottom: 60 }}>
      {/* Hero */}
      <div className="detail-hero">
        <div className="detail-hero-backdrop">
          <img src={getBackdropUrl(show.backdrop_path, 'w1280')} alt={show.name} />
          <div className="detail-hero-overlay" />
        </div>

        <div className="container detail-hero-content">
          <div className="detail-poster hide-mobile">
            <img src={getPosterUrl(show.poster_path, 'w342')} alt={show.name} />
          </div>

          <div className="detail-meta">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="badge badge-accent">TV Show</span>
              {show.vote_average > 0 && (
                <span className="badge badge-gold">
                  <Star size={10} fill="currentColor" />
                  {formatRating(show.vote_average)}
                </span>
              )}
              {show.status && <span className="badge badge-muted">{show.status}</span>}
            </div>

            <h1 className="detail-title">{show.name}</h1>
            {show.tagline && <p className="detail-tagline">"{show.tagline}"</p>}

            <div className="detail-quick-stats">
              <div className="stat-item"><Calendar size={14} /> <span>First Aired: {formatDate(show.first_air_date)}</span></div>
              <div className="stat-item"><Tv size={14} /> <span>{show.number_of_seasons} Seasons • {show.number_of_episodes} Episodes</span></div>
            </div>

            <p className="detail-overview">{show.overview}</p>

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
          {/* Main Content */}
          <div className="detail-main">
            {/* Cast */}
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

            {/* Seasons & Episodes Browser */}
            {show.seasons && show.seasons.length > 0 && (
              <div className="detail-section mt-8">
                <div className="flex-between mb-4">
                  <h3 className="section-title"><span className="accent-dot" />Season Browser</h3>
                  <select
                    className="select"
                    value={selectedSeasonNum}
                    onChange={(e) => setSelectedSeasonNum(parseInt(e.target.value))}
                  >
                    {show.seasons.map((s) => (
                      <option key={s.id} value={s.season_number}>
                        {s.name} ({s.episode_count} Episodes)
                      </option>
                    ))}
                  </select>
                </div>

                {seasonLoading ? (
                  <div className="loading-center"><div className="spinner" /></div>
                ) : seasonDetails && seasonDetails.episodes ? (
                  <div className="episodes-list">
                    {seasonDetails.episodes.map((ep) => (
                      <div key={ep.id} className="episode-item">
                        <div className="episode-still">
                          <img src={getStillUrl(ep.still_path, 'w300')} alt={ep.name} />
                          {ep.vote_average > 0 && (
                            <span className="episode-rating">★ {formatRating(ep.vote_average)}</span>
                          )}
                        </div>
                        <div className="episode-info">
                          <div className="episode-header">
                            <span className="episode-number">E{ep.episode_number}</span>
                            <h4 className="episode-title">{ep.name}</h4>
                          </div>
                          <span className="episode-airdate">{formatDate(ep.air_date)}</span>
                          <p className="episode-overview line-clamp-2 mt-2">{ep.overview || 'No overview available.'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted">Failed to load episode details.</div>
                )}
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="mt-8">
                <HorizontalScroll title="Recommended Shows">
                  {recommendations.map((s, i) => <TVCard key={s.id} show={s} index={i} />)}
                </HorizontalScroll>
              </div>
            )}
          </div>

          {/* Sidebar */}
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

              {show.type && (
                <div className="info-block">
                  <span className="info-label">Type</span>
                  <span className="info-value">{show.type}</span>
                </div>
              )}

              {show.networks && show.networks.length > 0 && (
                <div className="info-block">
                  <span className="info-label">Network</span>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {show.networks.map((net) => (
                      <span key={net.id} className="badge badge-muted">{net.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {show.created_by && show.created_by.length > 0 && (
                <div className="info-block">
                  <span className="info-label">Created By</span>
                  <div className="flex flex-col gap-1 mt-1">
                    {show.created_by.map((creator) => (
                      <Link to={`/person/${creator.id}`} key={creator.id} className="info-value text-accent underline">
                        {creator.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {imdbId || show.homepage ? (
                <div className="info-block">
                  <span className="info-label">Links</span>
                  <div className="flex gap-3 mt-2">
                    {show.homepage && (
                      <a href={show.homepage} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><Globe size={12} /> Website</a>
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
        
        .episodes-list { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
        .episode-item { display: flex; gap: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 12px; }
        @media (max-width: 640px) { .episode-item { flex-direction: column; } }
        .episode-still { width: 180px; flex-shrink: 0; aspect-ratio: 16/10; border-radius: var(--radius-md); overflow: hidden; position: relative; background: var(--bg-secondary); }
        @media (max-width: 640px) { .episode-still { width: 100%; } }
        .episode-still img { width: 100%; height: 100%; object-fit: cover; }
        .episode-rating { position: absolute; top: 8px; left: 8px; background: rgba(8,12,24,0.9); font-size: 11px; padding: 2px 6px; border-radius: var(--radius-full); font-weight: 700; color: var(--gold); }
        .episode-info { flex: 1; display: flex; flex-direction: column; }
        .episode-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 2px; }
        .episode-number { color: var(--accent); font-family: var(--font-display); font-weight: 700; font-size: 16px; }
        .episode-title { font-family: var(--font-display); font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .episode-airdate { font-size: 11px; color: var(--text-muted); }
        .episode-overview { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
        
        .iframe-container { position: relative; width: 100%; padding-bottom: 56.25%; height: 0; }
        .iframe-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .underline { text-decoration: underline; }
      `}</style>
    </div>
  );
}
