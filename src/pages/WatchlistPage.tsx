import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bookmark, Heart, Film, Tv } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import MovieCard from '../components/cards/MovieCard';
import TVCard from '../components/cards/TVCard';
import type { Movie, TVShow } from '../api/tmdb';

type TabType = 'watchlist' | 'favorites';

export default function WatchlistPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabType) || 'watchlist';

  const { watchlist, favorites } = useAppStore();
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  const items = activeTab === 'watchlist' ? watchlist : favorites;

  const filteredItems = items.filter((item) => {
    if (filterType === 'movie') return item.media_type === 'movie';
    if (filterType === 'tv') return item.media_type === 'tv';
    return true;
  });

  const handleTabChange = (tab: TabType) => {
    setSearchParams({ tab });
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            {activeTab === 'watchlist' ? <Bookmark size={28} /> : <Heart size={28} />}
            {activeTab === 'watchlist' ? 'My Watchlist' : 'My Favorites'}
          </h1>
          <span className="badge badge-muted">{items.length} Saved Items</span>
        </div>

        {/* Outer Tabs: Watchlist vs Favorites */}
        <div className="tabs mb-6">
          <button className={`tab ${activeTab === 'watchlist' ? 'active' : ''}`} onClick={() => handleTabChange('watchlist')}>
            Watchlist ({watchlist.length})
          </button>
          <button className={`tab ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => handleTabChange('favorites')}>
            Favorites ({favorites.length})
          </button>
        </div>

        {/* Inner Filter Type: All, Movies, TV Shows */}
        {items.length > 0 && (
          <div className="tabs mb-6" style={{ background: 'none', border: 'none', padding: 0, gap: 8 }}>
            <button className={`genre-chip ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>
              All
            </button>
            <button className={`genre-chip ${filterType === 'movie' ? 'active' : ''}`} onClick={() => setFilterType('movie')}>
              <Film size={12} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle' }} />
              Movies ({items.filter((i) => i.media_type === 'movie').length})
            </button>
            <button className={`genre-chip ${filterType === 'tv' ? 'active' : ''}`} onClick={() => setFilterType('tv')}>
              <Tv size={12} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle' }} />
              TV Shows ({items.filter((i) => i.media_type === 'tv').length})
            </button>
          </div>
        )}

        {/* Empty state or Grid */}
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            {activeTab === 'watchlist' ? (
              <Bookmark className="empty-state-icon" />
            ) : (
              <Heart className="empty-state-icon" />
            )}
            <h3>Your list is empty</h3>
            <p>
              {activeTab === 'watchlist'
                ? "Items you add to your watchlist will appear here."
                : "Items you mark as favorite will appear here."}
            </p>
          </div>
        ) : (
          <div className="grid-media">
            {filteredItems.map((item, i) => {
              if (item.media_type === 'movie') {
                return <MovieCard key={item.id} movie={item as Movie} index={i} />;
              } else {
                return <TVCard key={item.id} show={item as TVShow} index={i} />;
              }
            })}
          </div>
        )}
      </div>

      <style>{`
        .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .page-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
      `}</style>
    </div>
  );
}
