import { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

interface UseInfiniteScrollOptions<T> {
  fetchFn: (page: number) => Promise<{ results: T[]; total_pages: number }>;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  sentinelRef: (node: Element | null) => void;
  reset: () => void;
  totalResults?: number;
}

export function useInfiniteScroll<T>({
  fetchFn,
  enabled = true,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState<number | undefined>(undefined);
  const isMounted = useRef(true);
  const currentRequestSeq = useRef(0);

  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1, rootMargin: '200px' });

  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const load = useCallback(async (pageNum: number, isReset = false) => {
    if (loading && !isReset) return;
    setLoading(true);
    setError(null);

    if (pageNum === 1) {
      currentRequestSeq.current += 1;
    }
    const mySeq = currentRequestSeq.current;

    try {
      const data = await fetchFnRef.current(pageNum);
      if (!isMounted.current) return;
      if (mySeq !== currentRequestSeq.current) return;

      setItems((prev) => pageNum === 1 ? data.results : [...prev, ...data.results]);
      setTotalPages(data.total_pages);
      setTotalResults((data as { total_results?: number }).total_results);
      setPage(pageNum);
    } catch (err: unknown) {
      if (!isMounted.current) return;
      if (mySeq !== currentRequestSeq.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      if (isMounted.current && mySeq === currentRequestSeq.current) {
        setLoading(false);
      }
    }
  }, [loading]);

  // Initial load
  useEffect(() => {
    if (enabled) {
      load(1);
    }
  }, [enabled, load]);

  // Infinite scroll trigger
  useEffect(() => {
    if (inView && !loading && page < totalPages && enabled) {
      load(page + 1);
    }
  }, [inView, loading, page, totalPages, enabled, load]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setTotalPages(1);
    setError(null);
    load(1, true);
  }, [load]);

  return { items, loading, error, hasMore: page < totalPages, sentinelRef, reset, totalResults };
}
