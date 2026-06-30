# CineVerse 🎬

CineVerse is a premium, feature-rich Movie & TV show explorer built with React, TypeScript, and Vite. It connects directly with the TMDB API to deliver detailed insights into trending films, TV shows, cast members, season guides, and collections.

The user interface features a sleek dark mode design, rich visual gradients, subtle micro-animations (powered by Framer Motion), caching, and an infinite-scrolling media catalog.

## Key Features

- ⚡ **Seamless Landing**: Bypasses the onboarding setup page by using pre-configured API details automatically.
- 🎬 **Browse Movies & TV**: Explore Trending, Popular, Top Rated, Now Playing, and Airing Today categories.
- 🔍 **Smart Multi-Search**: Instantly search movies, TV shows, and people in one single input.
- 🌐 **Dynamic Language Filter**: Filter down movie and TV show discovery lists by original languages fetched live from TMDB.
- ❤️ **Personal Lists**: Manage local Watchlists and Favorites stored securely in the browser.
- ⚡ **Optimized Performance**:
  - **LRU Cache**: Caches GET responses locally to avoid redundant network calls and enable near-instant navigation.
  - **Token-bucket Rate Limiter**: Limits outgoing TMDB API requests automatically to respect API guidelines and avoid status `429` (too many requests) errors.
  - **Lazy Loading**: Splitting pages at the router level for optimized bundle sizing.

---

## Getting Started & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or another package manager

### 1. Installation
Clone the repository and install the dependencies:
```bash
# Install dependencies
npm install
```

### 2. Configuration & API Credentials
CineVerse uses TMDB's version 3 API.

The project is configured to use environment variables first, but includes a built-in fallback credential so it works out of the box. To configure your own keys:

Create a `.env` file in the root directory:
```env
VITE_TMDB_READ_ACCESS_TOKEN=your_tmdb_read_access_token_here
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

*Note: `.env` files are ignored by git to keep your credentials secure.*

---

## Available Scripts

In the project directory, you can run:

### `npm run dev`
Runs the app in development mode at [http://localhost:5173](http://localhost:5173).

### `npm run build`
Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run lint`
Runs [Oxlint](https://oxc.rs/) to quickly lint and check your TypeScript/React code quality.

---

## Tech Stack
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Modern Vanilla CSS + TailwindCSS HSL-tailored colors
- **State Management**: Zustand (with Persist middleware)
- **Animations**: Framer Motion
- **HTTP Client**: Axios (with custom rate-limiting and cache interceptors)
- **Icons**: Lucide React
