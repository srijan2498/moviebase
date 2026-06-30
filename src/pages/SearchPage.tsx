import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Film, Tv, Users } from 'lucide-react';
import MovieCard from '../components/cards/MovieCard';
import TVCard from '../components/cards/TVCard';
import PersonCard from '../components/cards/PersonCard';
import { useSearch } from '../hooks/useSearch';
import type { Movie, TVShow, Person } from '../api/tmdb';

type FilterType = 'all' | 'movie' | 'tv' | 'person';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const { results, loading, error, totalResults } = useSearch(query, 400);
  const [filter, setFilter] = useState<FilterType>('all');

  const movies = results.filter((r) => r.media_type === 'movie') as Movie[];
  const tvShows = results.filter((r) => r.media_type === 'tv') as TVShow[];
  const people = results.filter((r) => r.media_type === 'person') as Person[];

  const filteredResults = (() => {
    if (filter === 'movie') return movies;
    if (filter === 'tv') return tvShows;
    if (filter === 'person') return people;
    return results;
  })();

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title"><Search size={28} /> Search Results</h1>
          {query && (
            <span className="text-secondary font-display">
              for "<span className="text-accent">{query}</span>"
            </span>
          )}
          {!loading && (
            <span className="badge badge-muted">{totalResults} matches found</span>
          )}
        </div>

        {/* Tabs to filter search type */}
        <div className="tabs mb-6" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
          <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({results.length})
          </button>
          <button className={`tab ${filter === 'movie' ? 'active' : ''}`} onClick={() => setFilter('movie')}>
            <Film size={14} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle' }} />
            Movies ({movies.length})
          </button>
          <button className={`tab ${filter === 'tv' ? 'active' : ''}`} onClick={() => setFilter('tv')}>
            <Tv size={14} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle' }} />
            TV Shows ({tvShows.length})
          </button>
          <button className={`tab ${filter === 'person' ? 'active' : ''}`} onClick={() => setFilter('person')}>
            <Users size={14} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle' }} />
            People ({people.length})
          </button>
        </div>

        {/* Results Render */}
        {error && <div className="error-banner mb-4"><span>{error}</span></div>}

        {loading ? (
          <div className="loading-center">
            <div className="spinner spinner-lg" />
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="empty-state">
            <Search className="empty-state-icon" />
            <h3>No Results Found</h3>
            <p>We couldn't find anything matching your search. Try adjusting your spelling or searching for another title.</p>
          </div>
        ) : (
          <div className="grid-media">
            {filteredResults.map((item, i) => {
              const mediaType = (item as { media_type?: string }).media_type || filter;
              if (mediaType === 'movie') {
                return <MovieCard key={item.id} movie={item as Movie} index={i % 20} />;
              } else if (mediaType === 'tv') {
                return <TVCard key={item.id} show={item as TVShow} index={i % 20} />;
              } else {
                return <PersonCard key={item.id} person={item as Person} index={i % 20} />;
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
