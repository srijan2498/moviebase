import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, Cake, MapPin } from 'lucide-react';
import { getPersonDetails } from '../api/tmdb';
import type { Person, Movie, TVShow } from '../api/tmdb';
import { getProfileUrl, getPosterUrl } from '../utils/imageUrl';
import { formatDate } from '../utils/formatters';

export default function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullBio, setShowFullBio] = useState(false);
  const [activeFilmographyTab, setActiveFilmographyTab] = useState<'movies' | 'tv'>('movies');

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getPersonDetails(parseInt(id));
        setPerson(data);
      } catch (err) {
        setError('Failed to load person details.');
      } finally {
        setLoading(false);
      }
    }
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) return <div className="page loading-center"><div className="spinner spinner-lg" /></div>;
  if (error || !person) return <div className="page container mt-8"><div className="error-banner"><span>{error || 'Person not found'}</span></div></div>;

  // Extract filmography credits from appended response
  const appData = person as unknown as {
    movie_credits?: { cast: (Movie & { character: string })[]; crew: (Movie & { job: string; department: string })[] };
    tv_credits?: { cast: (TVShow & { character: string })[]; crew: (TVShow & { job: string; department: string })[] };
    external_ids?: { imdb_id?: string };
  };

  const movieCredits = appData.movie_credits?.cast || [];
  const tvCredits = appData.tv_credits?.cast || [];
  const imdbId = appData.external_ids?.imdb_id;

  // Sort filmography by popularity/release date
  const sortedMovies = [...movieCredits].sort((a, b) => b.popularity - a.popularity).slice(0, 16);
  const sortedTV = [...tvCredits].sort((a, b) => b.popularity - a.popularity).slice(0, 16);

  return (
    <div className="page" style={{ paddingBottom: 60 }}>
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="person-grid">
          {/* Sidebar profile info */}
          <div className="person-side">
            <div className="person-photo-container">
              <img src={getProfileUrl(person.profile_path, 'h632')} alt={person.name} className="person-photo" />
            </div>
            <div className="side-card mt-6">
              <h4 className="side-card-title">Personal Info</h4>

              <div className="info-block">
                <span className="info-label">Department</span>
                <span className="info-value">{person.known_for_department}</span>
              </div>

              {person.birthday && (
                <div className="info-block">
                  <span className="info-label">Born</span>
                  <span className="info-value">
                    <Cake size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                    {formatDate(person.birthday)}
                  </span>
                </div>
              )}

              {person.deathday && (
                <div className="info-block">
                  <span className="info-label">Died</span>
                  <span className="info-value">{formatDate(person.deathday)}</span>
                </div>
              )}

              {person.place_of_birth && (
                <div className="info-block">
                  <span className="info-label">Place of Birth</span>
                  <span className="info-value">
                    <MapPin size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                    {person.place_of_birth}
                  </span>
                </div>
              )}

              {imdbId && (
                <div className="info-block">
                  <span className="info-label">Links</span>
                  <a href={`https://www.imdb.com/name/${imdbId}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm mt-2">
                    <Award size={12} /> IMDb Profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Main biography + filmography */}
          <div className="person-main">
            <h1 className="person-name">{person.name}</h1>
            <p className="person-dept-badge">{person.known_for_department}</p>

            {person.biography && (
              <div className="detail-section mt-6">
                <h3 className="section-title mb-3"><span className="accent-dot" />Biography</h3>
                <p className={`person-bio ${showFullBio ? '' : 'line-clamp-6'}`}>{person.biography}</p>
                {person.biography.split('\n').length > 5 && (
                  <button className="btn btn-ghost btn-sm text-accent mt-2" onClick={() => setShowFullBio(!showFullBio)}>
                    {showFullBio ? 'Read Less ▲' : 'Read More ▼'}
                  </button>
                )}
              </div>
            )}

            {/* Filmography Section */}
            <div className="detail-section mt-8">
              <h3 className="section-title mb-4"><span className="accent-dot" />Known For</h3>

              <div className="tabs mb-6">
                <button className={`tab ${activeFilmographyTab === 'movies' ? 'active' : ''}`} onClick={() => setActiveFilmographyTab('movies')}>
                  Movies ({movieCredits.length})
                </button>
                <button className={`tab ${activeFilmographyTab === 'tv' ? 'active' : ''}`} onClick={() => setActiveFilmographyTab('tv')}>
                  TV Shows ({tvCredits.length})
                </button>
              </div>

              {activeFilmographyTab === 'movies' ? (
                sortedMovies.length === 0 ? (
                  <p className="text-muted">No movie credits available.</p>
                ) : (
                  <div className="filmography-grid">
                    {sortedMovies.map((movie) => (
                      <Link to={`/movie/${movie.id}`} key={movie.id} className="film-credit-card">
                        <div className="film-credit-poster">
                          <img src={getPosterUrl(movie.poster_path, 'w185')} alt={movie.title} />
                        </div>
                        <div className="film-credit-info">
                          <p className="film-credit-title line-clamp-1">{movie.title}</p>
                          {movie.character && <p className="film-credit-role line-clamp-1">as {movie.character}</p>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              ) : sortedTV.length === 0 ? (
                <p className="text-muted">No TV credits available.</p>
              ) : (
                <div className="filmography-grid">
                  {sortedTV.map((show) => (
                    <Link to={`/tv/${show.id}`} key={show.id} className="film-credit-card">
                      <div className="film-credit-poster">
                        <img src={getPosterUrl(show.poster_path, 'w185')} alt={show.name} />
                      </div>
                      <div className="film-credit-info">
                        <p className="film-credit-title line-clamp-1">{show.name}</p>
                        {show.character && <p className="film-credit-role line-clamp-1">as {show.character}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .person-grid { display: grid; grid-template-columns: 1fr; gap: 40px; }
        @media (min-width: 768px) { .person-grid { grid-template-columns: 280px 1fr; } }
        .person-photo-container { border-radius: var(--radius-xl); overflow: hidden; border: 2px solid var(--border); box-shadow: var(--shadow-lg); aspect-ratio: 2/3; background: var(--bg-card); }
        .person-photo { width: 100%; height: 100%; object-fit: cover; }
        .person-name { font-family: var(--font-display); font-size: clamp(28px, 5vw, 44px); font-weight: 900; line-height: 1.1; margin-bottom: 4px; }
        .person-dept-badge { display: inline-block; padding: 4px 12px; border-radius: var(--radius-full); background: var(--accent-glow); color: var(--accent); font-weight: 600; font-size: 13px; margin-bottom: 20px; }
        .person-bio { color: var(--text-secondary); font-size: 15px; line-height: 1.7; white-space: pre-line; }
        
        .filmography-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; }
        .film-credit-card { display: block; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; transition: all var(--transition); }
        .film-credit-card:hover { transform: translateY(-2px); border-color: var(--border-accent); }
        .film-credit-poster { aspect-ratio: 2/3; overflow: hidden; }
        .film-credit-poster img { width: 100%; height: 100%; object-fit: cover; }
        .film-credit-info { padding: 8px; }
        .film-credit-title { font-size: 12px; font-weight: 600; color: var(--text-primary); }
        .film-credit-role { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        
        .side-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 24px; }
        .side-card-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; margin-bottom: 16px; }
        .info-block { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
        .info-block:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
        .info-label { font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 600; letter-spacing: 0.05em; }
        .info-value { font-size: 14px; color: var(--text-primary); font-weight: 500; }
      `}</style>
    </div>
  );
}
