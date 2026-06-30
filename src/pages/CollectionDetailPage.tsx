import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCollectionDetails } from '../api/tmdb';
import type { Collection } from '../api/tmdb';
import { getBackdropUrl, getPosterUrl } from '../utils/imageUrl';
import MovieCard from '../components/cards/MovieCard';

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getCollectionDetails(parseInt(id));
        setCollection(data);
      } catch (err) {
        setError('Failed to load collection details.');
      } finally {
        setLoading(false);
      }
    }
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) return <div className="page loading-center"><div className="spinner spinner-lg" /></div>;
  if (error || !collection) return <div className="page container mt-8"><div className="error-banner"><span>{error || 'Collection not found'}</span></div></div>;

  const movies = collection.parts || [];

  return (
    <div className="page" style={{ paddingBottom: 60 }}>
      {/* Hero Backdrop Banner */}
      <div className="detail-hero">
        <div className="detail-hero-backdrop">
          <img src={getBackdropUrl(collection.backdrop_path, 'w1280')} alt={collection.name} />
          <div className="detail-hero-overlay" />
        </div>

        <div className="container detail-hero-content">
          <div className="detail-poster hide-mobile">
            <img src={getPosterUrl(collection.poster_path, 'w342')} alt={collection.name} />
          </div>

          <div className="detail-meta">
            <span className="badge badge-accent mb-2">Movie Collection</span>
            <h1 className="detail-title">{collection.name}</h1>
            <p className="detail-quick-stats">{movies.length} Movies</p>
            <p className="detail-overview">{collection.overview || 'No overview available for this collection.'}</p>
          </div>
        </div>
      </div>

      <div className="container mt-8">
        <h3 className="section-title mb-6"><span className="accent-dot" />Films in this Series</h3>
        <div className="grid-media">
          {movies.map((m, i) => (
            <MovieCard key={m.id} movie={m} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        .detail-hero { position: relative; min-height: 40vh; display: flex; align-items: flex-end; padding: 48px 0; overflow: hidden; }
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
        .detail-quick-stats { display: flex; gap: 16px; margin-bottom: 16px; color: var(--text-muted); font-size: 14px; font-weight: 600; }
        .detail-overview { font-size: 15px; line-height: 1.7; color: var(--text-secondary); margin-bottom: 24px; max-width: 800px; }
      `}</style>
    </div>
  );
}
