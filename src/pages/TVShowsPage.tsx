import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Tv, RotateCcw } from 'lucide-react';
import TVCard from '../components/cards/TVCard';
import { discoverTV, getTVGenres, getPopularTV, getTopRatedTV, getAiringTodayTV, getOnTheAirTV, getLanguages } from '../api/tmdb';
import type { TVShow, DiscoverTVParams } from '../api/tmdb';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useAppStore } from '../store/useAppStore';

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Top Rated' },
  { value: 'first_air_date.desc', label: 'Newest First' },
  { value: 'first_air_date.asc', label: 'Oldest First' },
];

const TABS = [
  { id: 'popular', label: 'Popular' },
  { id: 'top_rated', label: 'Top Rated' },
  { id: 'airing_today', label: 'Airing Today' },
  { id: 'on_the_air', label: 'On The Air' },
  { id: 'discover', label: '⚡ Discover' },
];

export default function TVShowsPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('sort') ?? 'popular');
  const [showFilters, setShowFilters] = useState(false);
  const [genre, setGenre] = useState(searchParams.get('genre') ?? '');
  const [language, setLanguage] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [minRating, setMinRating] = useState('');
  const [year, setYear] = useState('');
  const { tvGenres, setTVGenres, languages, setLanguages } = useAppStore();

  useEffect(() => {
    if (!tvGenres.length) {
      getTVGenres().then((r) => setTVGenres(r.genres));
    }
    if (!languages.length) {
      getLanguages().then((langs) => {
        const sorted = [...langs].sort((a, b) => a.english_name.localeCompare(b.english_name));
        setLanguages(sorted);
      });
    }
  }, []);

  const fetchFn = useCallback(async (page: number): Promise<{ results: TVShow[]; total_pages: number; total_results: number }> => {
    if (activeTab === 'discover') {
      const params: DiscoverTVParams = { page, sort_by: sortBy };
      if (genre) params.with_genres = genre;
      if (language) params.with_original_language = language;
      if (minRating) params['vote_average.gte'] = parseFloat(minRating);
      if (year) { params['first_air_date.gte'] = `${year}-01-01`; params['first_air_date.lte'] = `${year}-12-31`; }
      return discoverTV(params);
    }
    if (activeTab === 'top_rated') return getTopRatedTV(page);
    if (activeTab === 'airing_today') return getAiringTodayTV(page);
    if (activeTab === 'on_the_air') return getOnTheAirTV(page);
    return getPopularTV(page);
  }, [activeTab, genre, sortBy, minRating, year, language]);

  const { items, loading, error, hasMore, sentinelRef, reset, totalResults } = useInfiniteScroll<TVShow>({ fetchFn });

  const handleTabChange = (tab: string) => { setActiveTab(tab); reset(); };
  const handleApplyFilters = () => { if (activeTab !== 'discover') setActiveTab('discover'); else reset(); };
  const handleReset = () => { setGenre(''); setLanguage(''); setSortBy('popularity.desc'); setMinRating(''); setYear(''); reset(); };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title"><Tv size={28} /> TV Shows</h1>
          {totalResults !== undefined && (
            <span className="badge badge-muted">{totalResults.toLocaleString()} results</span>
          )}
          <button
            className={`btn btn-secondary btn-sm ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs mb-6" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            className="filter-panel mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <div className="filter-group">
              <label className="filter-label">Genre</label>
              <select className="select" value={genre} onChange={(e) => setGenre(e.target.value)}>
                <option value="">All Genres</option>
                {tvGenres.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Min Rating</label>
              <select className="select" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
                <option value="">Any</option>
                {[5, 6, 7, 8, 9].map((r) => <option key={r} value={r}>{r}+</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Language</label>
              <select className="select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="">All Languages</option>
                {languages.map((l) => (
                  <option key={l.iso_639_1} value={l.iso_639_1}>{l.english_name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Year</label>
              <input
                type="number"
                className="input"
                placeholder="2024"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="1900"
                max="2030"
                style={{ width: 100 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-end' }}>
              <button className="btn btn-primary btn-sm" onClick={handleApplyFilters}>Apply</button>
              <button className="btn btn-ghost btn-sm" onClick={handleReset}><RotateCcw size={14} /></button>
            </div>
          </motion.div>
        )}

        {/* Grid */}
        {error && <div className="error-banner mb-4"><span>{error}</span></div>}
        <div className="grid-media">
          {items.map((s, i) => <TVCard key={s.id} show={s} index={i % 20} />)}
          {loading && Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
        <div ref={sentinelRef} style={{ height: 40 }} />
        {!hasMore && !loading && items.length > 0 && (
          <p className="text-center text-muted mt-8">You've seen everything! 🎉</p>
        )}
      </div>

      <style>{`
        .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .page-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        .text-center { text-align: center; }
      `}</style>
    </div>
  );
}
