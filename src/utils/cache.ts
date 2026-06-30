/** Simple LRU (Least Recently Used) cache */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

class LRUCache {
  private map: Map<string, CacheEntry<unknown>>;
  private readonly maxSize: number;
  private readonly ttlMs: number; // time-to-live in ms

  constructor(maxSize = 50, ttlMs = 5 * 60 * 1000) {
    this.map = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  get<T>(key: string): T | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;

    // Check TTL
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.map.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value as T;
  }

  set<T>(key: string, value: T): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxSize) {
      // Evict least recently used (first entry)
      const firstKey = this.map.keys().next().value;
      if (firstKey) this.map.delete(firstKey);
    }
    this.map.set(key, { value, timestamp: Date.now() });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.map.clear();
  }

  get size(): number {
    return this.map.size;
  }
}

export const lruCache = new LRUCache(100, 5 * 60 * 1000);
export default lruCache;
