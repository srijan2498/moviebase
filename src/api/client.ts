import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import rateLimiter from './rateLimiter';
import { lruCache } from '../utils/cache';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const TMDB_READ_ACCESS_TOKEN = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxNTE2Nzg4OGE0MDUwM2VjMTljOWFhYzlhMTFmZDE1NSIsIm5iZiI6MTc4Mjc4MjM3OS42NTIsInN1YiI6IjZhNDMxOWFiY2JhZWQ0MDA0NmE1MzNlZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.jcaJDH1dAUjNL2zyeg53VLQMgaypzIQsWOUvgWVROOE';

let apiKey: string | null = null;

export function setApiKey(key: string) {
  apiKey = key;
  localStorage.setItem('CineOrbit_api_key', key);
}

export function getApiKey(): string | null {
  if (!apiKey) {
    apiKey = localStorage.getItem('CineOrbit_api_key') || TMDB_READ_ACCESS_TOKEN;
  }
  return apiKey;
}

export function clearApiKey() {
  apiKey = null;
  localStorage.removeItem('CineOrbit_api_key');
}

const instance: AxiosInstance = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 15000,
});

// Request interceptor: apply rate limiting + auth header
instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Apply rate limiting
  await rateLimiter.acquire();

  // Apply auth
  const key = getApiKey();
  if (key) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${key}`;
  }

  return config;
});

// Response interceptor: cache successful GET responses
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.config.method === 'get') {
      const cacheKey = `${response.config.url}?${JSON.stringify(response.config.params ?? {})}`;
      lruCache.set(cacheKey, response.data);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/** Cached GET request - returns cache hit immediately, otherwise fetches */
export async function cachedGet<T = unknown>(
  url: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const cacheKey = `${url}?${JSON.stringify(params)}`;
  const cached = lruCache.get<T>(cacheKey);
  if (cached !== undefined) return cached;

  const response = await instance.get<T>(url, { params });
  return response.data;
}

export default instance;
