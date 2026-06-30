import { useState, useEffect, useRef } from 'react';
import { searchMulti } from '../api/tmdb';
import type { Movie, TVShow, Person } from '../api/tmdb';

export type SearchResult = (Movie | TVShow | Person) & { media_type: 'movie' | 'tv' | 'person' };

interface UseSearchReturn {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  totalResults: number;
}

export function useSearch(query: string, debounceMs = 400): UseSearchReturn {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!query.trim()) {
      setResults([]);
      setTotalResults(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchMulti(query);
        if (!isMounted.current) return;
        setResults(data.results as SearchResult[]);
        setTotalResults(data.total_results);
        setError(null);
      } catch (err) {
        if (!isMounted.current) return;
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, debounceMs]);

  return { results, loading, error, totalResults };
}
