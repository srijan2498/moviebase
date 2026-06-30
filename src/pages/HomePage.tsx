import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Clock, Sparkles, Film, Tv } from 'lucide-react';
import HeroCarousel from '../components/carousel/HeroCarousel';
import HorizontalScroll from '../components/carousel/HorizontalScroll';
import MovieCard from '../components/cards/MovieCard';
import TVCard from '../components/cards/TVCard';
import {
  getTrending, getPopularMovies, getPopularTV,
  getNowPlayingMovies, getUpcomingMovies, getTopRatedMovies,
  getMovieGenres, getTVGenres,
} from '../api/tmdb';
import type { Movie, TVShow } from '../api/tmdb';
import { useAppStore } from '../store/useAppStore';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [trending, setTrending] = useState<(Movie | TVShow)[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTV, setPopularTV] = useState<TVShow[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { setMovieGenres, setTVGenres, movieGenres } = useAppStore();

  useEffect(() => {
    async function load() {
      try {
        const [trendData, popMovies, popTV, nowPlay, upcom, topR, mg, tvg] = await Promise.all([
          getTrending('all', 'week'),
          getPopularMovies(),
          getPopularTV(),
          getNowPlayingMovies(),
          getUpcomingMovies(),
          getTopRatedMovies(),
          getMovieGenres(),
          getTVGenres(),
        ]);
        setTrending(trendData.results.slice(0, 10) as (Movie | TVShow)[]);
        setPopularMovies(popMovies.results);
        setPopularTV(popTV.results);
        setNowPlaying(nowPlay.results);
        setUpcoming(upcom.results);
        setTopRated(topR.results);
        setMovieGenres(mg.genres);
        setTVGenres(tvg.genres);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="page loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="page">
      {/* Hero */}
      <HeroCarousel items={trending as (Movie | TVShow & { media_type?: 'movie' | 'tv' })[]} />

      <div className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>

        {/* Genre Explore Banner */}
        <motion.div
          className="genre-explore-banner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="genre-explore-content">
            <h2>🎭 Explore by Genre</h2>
            <p>Discover movies and shows across every genre</p>
          </div>
          <div className="genre-explore-chips">
            {movieGenres.slice(0, 10).map((g) => (
              <Link
                key={g.id}
                to={`/movies?genre=${g.id}&name=${encodeURIComponent(g.name)}`}
                className="genre-chip"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Popular Movies */}
        <HorizontalScroll title="Popular Movies" viewAllLink="/movies" icon={<Film size={18} />}>
          {popularMovies.map((m, i) => (
            <MovieCard key={m.id} movie={m} index={i} />
          ))}
        </HorizontalScroll>

        {/* Trending This Week */}
        <HorizontalScroll title="Trending This Week" icon={<Flame size={18} />}>
          {trending.map((item, i) => {
            const isMovie = (item as Movie).title !== undefined;
            return isMovie
              ? <MovieCard key={item.id} movie={item as Movie} index={i} />
              : <TVCard key={item.id} show={item as TVShow} index={i} />;
          })}
        </HorizontalScroll>

        {/* Popular TV */}
        <HorizontalScroll title="Popular TV Shows" viewAllLink="/tv" icon={<Tv size={18} />}>
          {popularTV.map((s, i) => (
            <TVCard key={s.id} show={s} index={i} />
          ))}
        </HorizontalScroll>

        {/* Now Playing */}
        <HorizontalScroll title="Now Playing in Theaters" icon={<Clock size={18} />}>
          {nowPlaying.map((m, i) => (
            <MovieCard key={m.id} movie={m} index={i} />
          ))}
        </HorizontalScroll>

        {/* Top Rated */}
        <HorizontalScroll title="Top Rated Movies" viewAllLink="/movies?sort=top_rated" icon={<TrendingUp size={18} />}>
          {topRated.map((m, i) => (
            <MovieCard key={m.id} movie={m} index={i} />
          ))}
        </HorizontalScroll>

        {/* Upcoming */}
        <HorizontalScroll title="Coming Soon" icon={<Sparkles size={18} />}>
          {upcoming.map((m, i) => (
            <MovieCard key={m.id} movie={m} index={i} />
          ))}
        </HorizontalScroll>
      </div>

      <style>{`
        .genre-explore-banner {
          background: linear-gradient(135deg, rgba(1, 180, 228, 0.1), rgba(99, 102, 241, 0.1));
          border: 1px solid var(--border-accent); border-radius: var(--radius-xl);
          padding: 28px; margin-bottom: 48px;
        }
        .genre-explore-content { margin-bottom: 16px; }
        .genre-explore-content h2 { font-family: var(--font-display); font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        .genre-explore-content p { color: var(--text-secondary); font-size: 14px; }
        .genre-explore-chips { display: flex; flex-wrap: wrap; gap: 8px; }
      `}</style>
    </div>
  );
}
