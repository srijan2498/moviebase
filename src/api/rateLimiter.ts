/**
 * Token-bucket rate limiter for TMDB API
 * TMDB allows ~40 requests per 10 seconds.
 * We use 38 tokens capacity with a 10s refill window.
 */

interface QueuedRequest {
  resolve: () => void;
  reject: (err: Error) => void;
}

class TokenBucketRateLimiter {
  private tokens: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per ms
  private lastRefillTime: number;
  private queue: QueuedRequest[];
  private draining: boolean;

  constructor(capacity = 38, refillIntervalMs = 10000) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = capacity / refillIntervalMs;
    this.lastRefillTime = Date.now();
    this.queue = [];
    this.draining = false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefillTime;
    const tokensToAdd = elapsed * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefillTime = now;
  }

  private async drain(): Promise<void> {
    if (this.draining) return;
    this.draining = true;

    while (this.queue.length > 0) {
      this.refill();

      if (this.tokens >= 1) {
        this.tokens -= 1;
        const next = this.queue.shift();
        if (next) next.resolve();
      } else {
        // Wait until we have a token
        const waitMs = Math.ceil((1 - this.tokens) / this.refillRate);
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }

    this.draining = false;
  }

  /** Acquire a token (resolves when the request may proceed) */
  acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      this.queue.push({ resolve, reject });
      this.drain();
    });
  }

  /** Returns queue depth for monitoring */
  getQueueDepth(): number {
    return this.queue.length;
  }

  /** Returns current token count */
  getTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}

export const rateLimiter = new TokenBucketRateLimiter(38, 10000);
export default rateLimiter;
