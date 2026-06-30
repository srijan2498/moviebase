import { cachedGet } from './client';

// ─── Type Definitions ──────────────────────────────────────────────────────────

export interface Genre { id: number; name: string; }
export interface ProductionCompany { id: number; name: string; logo_path: string | null; origin_country: string; }
export interface ProductionCountry { iso_3166_1: string; name: string; }
export interface SpokenLanguage { english_name: string; iso_639_1: string; name: string; }
export interface Network { id: number; name: string; logo_path: string | null; origin_country: string; }
export interface CreatedBy { id: number; name: string; profile_path: string | null; }

export interface Movie {
  id: number; title: string; original_title: string; overview: string;
  poster_path: string | null; backdrop_path: string | null;
  release_date: string; vote_average: number; vote_count: number;
  popularity: number; genre_ids?: number[]; genres?: Genre[];
  runtime?: number; budget?: number; revenue?: number;
  status?: string; tagline?: string; homepage?: string; imdb_id?: string;
  production_companies?: ProductionCompany[]; production_countries?: ProductionCountry[];
  spoken_languages?: SpokenLanguage[]; adult: boolean; video: boolean;
  original_language: string; belongs_to_collection?: Collection | null;
}

export interface TVShow {
  id: number; name: string; original_name: string; overview: string;
  poster_path: string | null; backdrop_path: string | null;
  first_air_date: string; last_air_date?: string;
  vote_average: number; vote_count: number; popularity: number;
  genre_ids?: number[]; genres?: Genre[];
  number_of_seasons?: number; number_of_episodes?: number;
  status?: string; tagline?: string; homepage?: string;
  type?: string; original_language: string;
  networks?: Network[]; created_by?: CreatedBy[];
  production_companies?: ProductionCompany[];
  seasons?: TVSeason[];
  in_production?: boolean;
}

export interface TVSeason {
  id: number; name: string; overview: string;
  poster_path: string | null; season_number: number;
  episode_count?: number; air_date?: string; episodes?: TVEpisode[];
}

export interface TVEpisode {
  id: number; name: string; overview: string;
  still_path: string | null; episode_number: number; season_number: number;
  air_date: string; vote_average: number; vote_count: number; runtime?: number;
}

export interface Person {
  id: number; name: string; profile_path: string | null;
  known_for_department: string; popularity: number;
  biography?: string; birthday?: string; deathday?: string | null;
  place_of_birth?: string; also_known_as?: string[];
  gender?: number; homepage?: string | null; imdb_id?: string;
  known_for?: (Movie | TVShow)[];
}

export interface Cast {
  id: number; name: string; character: string; profile_path: string | null;
  order: number; known_for_department: string; credit_id: string;
}

export interface Crew {
  id: number; name: string; job: string; department: string;
  profile_path: string | null; credit_id: string;
}

export interface Credits { id: number; cast: Cast[]; crew: Crew[]; }

export interface Video {
  id: string; key: string; name: string; site: string;
  type: string; official: boolean; size: number; published_at: string;
}

export interface Image {
  file_path: string; width: number; height: number;
  aspect_ratio: number; vote_average: number; vote_count: number;
  iso_639_1: string | null;
}

export interface Images { backdrops: Image[]; posters: Image[]; logos?: Image[]; }

export interface Review {
  id: string; author: string; content: string;
  created_at: string; updated_at: string;
  author_details: { name: string; username: string; avatar_path: string | null; rating: number | null; };
  url: string;
}

export interface Collection {
  id: number; name: string; overview: string;
  poster_path: string | null; backdrop_path: string | null;
  parts?: Movie[];
}

export interface PaginatedResponse<T> {
  page: number; results: T[]; total_pages: number; total_results: number;
}

export interface ExternalIds {
  imdb_id?: string | null; tvdb_id?: number | null;
  facebook_id?: string | null; instagram_id?: string | null; twitter_id?: string | null;
  homepage?: string | null;
}

export interface Configuration {
  images: {
    base_url: string; secure_base_url: string;
    backdrop_sizes: string[]; logo_sizes: string[];
    poster_sizes: string[]; profile_sizes: string[]; still_sizes: string[];
  };
  change_keys: string[];
}

export interface WatchProviders {
  results: {
    [countryCode: string]: {
      link: string;
      flatrate?: { logo_path: string; provider_id: number; provider_name: string; display_priority: number; }[];
      rent?: { logo_path: string; provider_id: number; provider_name: string; display_priority: number; }[];
      buy?: { logo_path: string; provider_id: number; provider_name: string; display_priority: number; }[];
    };
  };
}

export interface Keyword { id: number; name: string; }

// ─── Configuration ──────────────────────────────────────────────────────────────

export const getConfiguration = () =>
  cachedGet<Configuration>('/configuration');

export const getMovieGenres = () =>
  cachedGet<{ genres: Genre[] }>('/genre/movie/list');

export const getTVGenres = () =>
  cachedGet<{ genres: Genre[] }>('/genre/tv/list');

export const getLanguages = () =>
  cachedGet<{ iso_639_1: string; english_name: string; name: string }[]>('/configuration/languages');

export const getCountries = () =>
  cachedGet<{ iso_3166_1: string; english_name: string; native_name: string }[]>('/configuration/countries');

// ─── Trending ───────────────────────────────────────────────────────────────────

export const getTrending = (mediaType: 'all' | 'movie' | 'tv' | 'person', timeWindow: 'day' | 'week' = 'day', page = 1) =>
  cachedGet<PaginatedResponse<Movie & TVShow & Person>>(`/trending/${mediaType}/${timeWindow}`, { page });

// ─── Movies ─────────────────────────────────────────────────────────────────────

export const getPopularMovies = (page = 1, region?: string) =>
  cachedGet<PaginatedResponse<Movie>>('/movie/popular', { page, region });

export const getTopRatedMovies = (page = 1, region?: string) =>
  cachedGet<PaginatedResponse<Movie>>('/movie/top_rated', { page, region });

export const getNowPlayingMovies = (page = 1, region?: string) =>
  cachedGet<PaginatedResponse<Movie>>('/movie/now_playing', { page, region });

export const getUpcomingMovies = (page = 1, region?: string) =>
  cachedGet<PaginatedResponse<Movie>>('/movie/upcoming', { page, region });

export const getMovieDetails = (id: number) =>
  cachedGet<Movie>(`/movie/${id}`, { append_to_response: 'credits,videos,images,similar,recommendations,reviews,external_ids,keywords,watch/providers' });

export const getMovieCredits = (id: number) =>
  cachedGet<Credits>(`/movie/${id}/credits`);

export const getMovieVideos = (id: number) =>
  cachedGet<{ id: number; results: Video[] }>(`/movie/${id}/videos`);

export const getMovieImages = (id: number) =>
  cachedGet<Images>(`/movie/${id}/images`, { include_image_language: 'en,null' });

export const getSimilarMovies = (id: number, page = 1) =>
  cachedGet<PaginatedResponse<Movie>>(`/movie/${id}/similar`, { page });

export const getMovieRecommendations = (id: number, page = 1) =>
  cachedGet<PaginatedResponse<Movie>>(`/movie/${id}/recommendations`, { page });

export const getMovieReviews = (id: number, page = 1) =>
  cachedGet<PaginatedResponse<Review>>(`/movie/${id}/reviews`, { page });

export const getMovieExternalIds = (id: number) =>
  cachedGet<ExternalIds>(`/movie/${id}/external_ids`);

export const getMovieKeywords = (id: number) =>
  cachedGet<{ id: number; keywords: Keyword[] }>(`/movie/${id}/keywords`);

export const getMovieWatchProviders = (id: number) =>
  cachedGet<WatchProviders>(`/movie/${id}/watch/providers`);

export const getMovieChanges = (id: number) =>
  cachedGet<{ changes: unknown[] }>(`/movie/${id}/changes`);

// ─── TV Shows ───────────────────────────────────────────────────────────────────

export const getPopularTV = (page = 1) =>
  cachedGet<PaginatedResponse<TVShow>>('/tv/popular', { page });

export const getTopRatedTV = (page = 1) =>
  cachedGet<PaginatedResponse<TVShow>>('/tv/top_rated', { page });

export const getAiringTodayTV = (page = 1) =>
  cachedGet<PaginatedResponse<TVShow>>('/tv/airing_today', { page });

export const getOnTheAirTV = (page = 1) =>
  cachedGet<PaginatedResponse<TVShow>>('/tv/on_the_air', { page });

export const getTVDetails = (id: number) =>
  cachedGet<TVShow>(`/tv/${id}`, { append_to_response: 'credits,videos,images,similar,recommendations,external_ids,keywords,watch/providers' });

export const getTVCredits = (id: number) =>
  cachedGet<Credits>(`/tv/${id}/credits`);

export const getTVVideos = (id: number) =>
  cachedGet<{ id: number; results: Video[] }>(`/tv/${id}/videos`);

export const getTVImages = (id: number) =>
  cachedGet<Images>(`/tv/${id}/images`, { include_image_language: 'en,null' });

export const getSimilarTV = (id: number, page = 1) =>
  cachedGet<PaginatedResponse<TVShow>>(`/tv/${id}/similar`, { page });

export const getTVRecommendations = (id: number, page = 1) =>
  cachedGet<PaginatedResponse<TVShow>>(`/tv/${id}/recommendations`, { page });

export const getTVExternalIds = (id: number) =>
  cachedGet<ExternalIds>(`/tv/${id}/external_ids`);

export const getTVKeywords = (id: number) =>
  cachedGet<{ id: number; results: Keyword[] }>(`/tv/${id}/keywords`);

export const getTVWatchProviders = (id: number) =>
  cachedGet<WatchProviders>(`/tv/${id}/watch/providers`);

export const getTVSeasonDetails = (seriesId: number, seasonNumber: number) =>
  cachedGet<TVSeason>(`/tv/${seriesId}/season/${seasonNumber}`, {
    append_to_response: 'credits,images,videos'
  });

export const getTVSeasonImages = (seriesId: number, seasonNumber: number) =>
  cachedGet<{ id: number; posters: Image[] }>(`/tv/${seriesId}/season/${seasonNumber}/images`);

export const getTVEpisodeDetails = (seriesId: number, seasonNumber: number, episodeNumber: number) =>
  cachedGet<TVEpisode>(`/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`);

export const getTVEpisodeImages = (seriesId: number, seasonNumber: number, episodeNumber: number) =>
  cachedGet<{ id: number; stills: Image[] }>(`/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}/images`);

// ─── People ─────────────────────────────────────────────────────────────────────

export const getPopularPeople = (page = 1) =>
  cachedGet<PaginatedResponse<Person>>('/person/popular', { page });

export const getPersonDetails = (id: number) =>
  cachedGet<Person>(`/person/${id}`, { append_to_response: 'movie_credits,tv_credits,images,external_ids' });

export const getPersonMovieCredits = (id: number) =>
  cachedGet<{ id: number; cast: (Movie & { character: string })[]; crew: (Movie & { job: string; department: string })[] }>(`/person/${id}/movie_credits`);

export const getPersonTVCredits = (id: number) =>
  cachedGet<{ id: number; cast: (TVShow & { character: string })[]; crew: (TVShow & { job: string; department: string })[] }>(`/person/${id}/tv_credits`);

export const getPersonImages = (id: number) =>
  cachedGet<{ id: number; profiles: Image[] }>(`/person/${id}/images`);

export const getPersonCombinedCredits = (id: number) =>
  cachedGet<{ id: number; cast: unknown[]; crew: unknown[] }>(`/person/${id}/combined_credits`);

export const getPersonExternalIds = (id: number) =>
  cachedGet<ExternalIds>(`/person/${id}/external_ids`);

// ─── Discover ───────────────────────────────────────────────────────────────────

export interface DiscoverMovieParams {
  page?: number; sort_by?: string; with_genres?: string;
  'primary_release_date.gte'?: string; 'primary_release_date.lte'?: string;
  'vote_average.gte'?: number; 'vote_average.lte'?: number;
  'vote_count.gte'?: number; with_original_language?: string;
  region?: string; include_adult?: boolean; include_video?: boolean;
  with_keywords?: string; without_keywords?: string;
  with_runtime_gte?: number; with_runtime_lte?: number;
  with_companies?: string; with_watch_providers?: string;
  watch_region?: string; with_watch_monetization_types?: string;
}

export interface DiscoverTVParams {
  page?: number; sort_by?: string; with_genres?: string;
  'first_air_date.gte'?: string; 'first_air_date.lte'?: string;
  'vote_average.gte'?: number; 'vote_average.lte'?: number;
  'vote_count.gte'?: number; with_original_language?: string;
  with_networks?: string; with_companies?: string;
  with_keywords?: string; without_keywords?: string;
  with_runtime_gte?: number; with_runtime_lte?: number;
  screened_theatrically?: boolean; include_null_first_air_dates?: boolean;
  with_watch_providers?: string; watch_region?: string;
}

export const discoverMovies = (params: DiscoverMovieParams = {}) =>
  cachedGet<PaginatedResponse<Movie>>('/discover/movie', { ...params });

export const discoverTV = (params: DiscoverTVParams = {}) =>
  cachedGet<PaginatedResponse<TVShow>>('/discover/tv', { ...params });

// ─── Search ─────────────────────────────────────────────────────────────────────

export const searchMulti = (query: string, page = 1) =>
  cachedGet<PaginatedResponse<(Movie | TVShow | Person) & { media_type: 'movie' | 'tv' | 'person' }>>('/search/multi', { query, page, include_adult: false });

export const searchMovies = (query: string, page = 1, params: Record<string, unknown> = {}) =>
  cachedGet<PaginatedResponse<Movie>>('/search/movie', { query, page, include_adult: false, ...params });

export const searchTV = (query: string, page = 1) =>
  cachedGet<PaginatedResponse<TVShow>>('/search/tv', { query, page, include_adult: false });

export const searchPeople = (query: string, page = 1) =>
  cachedGet<PaginatedResponse<Person>>('/search/person', { query, page, include_adult: false });

export const searchCollections = (query: string, page = 1) =>
  cachedGet<PaginatedResponse<Collection>>('/search/collection', { query, page });

export const searchKeywords = (query: string, page = 1) =>
  cachedGet<PaginatedResponse<Keyword>>('/search/keyword', { query, page });

// ─── Collections ────────────────────────────────────────────────────────────────

export const getCollectionDetails = (id: number) =>
  cachedGet<Collection>(`/collection/${id}`);

export const getCollectionImages = (id: number) =>
  cachedGet<{ id: number; backdrops: Image[]; posters: Image[] }>(`/collection/${id}/images`);
