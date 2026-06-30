import { useCallback } from 'react';
import { Users } from 'lucide-react';
import PersonCard from '../components/cards/PersonCard';
import { getPopularPeople } from '../api/tmdb';
import type { Person } from '../api/tmdb';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export default function PeoplePage() {
  const fetchFn = useCallback(async (page: number) => {
    return getPopularPeople(page);
  }, []);

  const { items, loading, error, hasMore, sentinelRef, totalResults } = useInfiniteScroll<Person>({ fetchFn });

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title"><Users size={28} /> Popular People</h1>
          {totalResults !== undefined && (
            <span className="badge badge-muted">{totalResults.toLocaleString()} people</span>
          )}
        </div>

        {/* Grid */}
        {error && <div className="error-banner mb-4"><span>{error}</span></div>}
        
        <div className="grid-people">
          {items.map((person, i) => (
            <PersonCard key={person.id} person={person} index={i % 20} />
          ))}
          {loading && Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: '50%' }} />
          ))}
        </div>

        <div ref={sentinelRef} style={{ height: 40 }} />
        {!hasMore && !loading && items.length > 0 && (
          <p className="text-center text-muted mt-8">You've reached the end! 🎉</p>
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
