import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { useAppStore } from './store/useAppStore';
import { Sparkles } from 'lucide-react';

// Lazy load pages for performance optimization
const HomePage = lazy(() => import('./pages/HomePage'));
const MoviesPage = lazy(() => import('./pages/MoviesPage'));
const TVShowsPage = lazy(() => import('./pages/TVShowsPage'));
const PeoplePage = lazy(() => import('./pages/PeoplePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const MovieDetailPage = lazy(() => import('./pages/MovieDetailPage'));
const TVDetailPage = lazy(() => import('./pages/TVDetailPage'));
const PersonDetailPage = lazy(() => import('./pages/PersonDetailPage'));
const CollectionDetailPage = lazy(() => import('./pages/CollectionDetailPage'));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'));

export default function App() {
  const { toastMessage, clearToast } = useAppStore();

  return (
    <Router>
      <div className="app-shell bg-gradient-hero">
        <Navbar />

        <main className="app-main">
          <Suspense
            fallback={
              <div className="page loading-center" style={{ minHeight: '100vh' }}>
                <div className="spinner spinner-lg" />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/tv" element={<TVShowsPage />} />
              <Route path="/people" element={<PeoplePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/movie/:id" element={<MovieDetailPage />} />
              <Route path="/tv/:id" element={<TVDetailPage />} />
              <Route path="/person/:id" element={<PersonDetailPage />} />
              <Route path="/collection/:id" element={<CollectionDetailPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="toast" onClick={clearToast}>
            <Sparkles size={16} className="text-accent" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      <style>{`
        .app-shell {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .app-main {
          flex: 1;
        }
      `}</style>
    </Router>
  );
}
