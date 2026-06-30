import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Genre, Movie, TVShow } from '../api/tmdb';
import { TMDB_READ_ACCESS_TOKEN } from '../api/client';

export type WatchlistItem = (Movie | TVShow) & { media_type: 'movie' | 'tv' };

export interface Language {
  iso_639_1: string;
  english_name: string;
  name: string;
}

interface AppState {
  // API key
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;

  // Genres cache
  movieGenres: Genre[];
  tvGenres: Genre[];
  setMovieGenres: (genres: Genre[]) => void;
  setTVGenres: (genres: Genre[]) => void;
  getGenreName: (id: number) => string;

  // Languages cache
  languages: Language[];
  setLanguages: (languages: Language[]) => void;

  // Watchlist
  watchlist: WatchlistItem[];
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: number, mediaType: 'movie' | 'tv') => void;
  isInWatchlist: (id: number, mediaType: 'movie' | 'tv') => boolean;

  // Favorites
  favorites: WatchlistItem[];
  addToFavorites: (item: WatchlistItem) => void;
  removeFromFavorites: (id: number, mediaType: 'movie' | 'tv') => void;
  isInFavorites: (id: number, mediaType: 'movie' | 'tv') => boolean;

  // UI
  toastMessage: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // API key
      apiKey: localStorage.getItem('cineverse_api_key') || TMDB_READ_ACCESS_TOKEN,
      setApiKey: (key) => {
        localStorage.setItem('cineverse_api_key', key);
        set({ apiKey: key });
      },
      clearApiKey: () => {
        localStorage.removeItem('cineverse_api_key');
        set({ apiKey: null });
      },

      // Genres
      movieGenres: [],
      tvGenres: [],
      setMovieGenres: (genres) => set({ movieGenres: genres }),
      setTVGenres: (genres) => set({ tvGenres: genres }),
      getGenreName: (id) => {
        const { movieGenres, tvGenres } = get();
        const all = [...movieGenres, ...tvGenres];
        return all.find((g) => g.id === id)?.name ?? '';
      },

      // Languages
      languages: [],
      setLanguages: (languages) => set({ languages }),

      // Watchlist
      watchlist: [],
      addToWatchlist: (item) =>
        set((s) => {
          if (s.watchlist.some((i) => i.id === item.id && i.media_type === item.media_type)) return s;
          return { watchlist: [item, ...s.watchlist] };
        }),
      removeFromWatchlist: (id, mediaType) =>
        set((s) => ({ watchlist: s.watchlist.filter((i) => !(i.id === id && i.media_type === mediaType)) })),
      isInWatchlist: (id, mediaType) =>
        get().watchlist.some((i) => i.id === id && i.media_type === mediaType),

      // Favorites
      favorites: [],
      addToFavorites: (item) =>
        set((s) => {
          if (s.favorites.some((i) => i.id === item.id && i.media_type === item.media_type)) return s;
          return { favorites: [item, ...s.favorites] };
        }),
      removeFromFavorites: (id, mediaType) =>
        set((s) => ({ favorites: s.favorites.filter((i) => !(i.id === id && i.media_type === mediaType)) })),
      isInFavorites: (id, mediaType) =>
        get().favorites.some((i) => i.id === id && i.media_type === mediaType),

      // UI
      toastMessage: null,
      showToast: (msg) => {
        set({ toastMessage: msg });
        setTimeout(() => set({ toastMessage: null }), 3000);
      },
      clearToast: () => set({ toastMessage: null }),
    }),
    {
      name: 'cineverse-storage',
      partialize: (state) => ({
        watchlist: state.watchlist,
        favorites: state.favorites,
        apiKey: state.apiKey,
        languages: state.languages,
      }),
    }
  )
);
