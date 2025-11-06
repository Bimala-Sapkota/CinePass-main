import React, { useState, useEffect, useCallback } from "react";
import {
  FaSearch,
  FaFilter,
  FaTh,
  FaList,
  FaHeart,
  FaPlay,
  FaBell,
  FaStar,
  FaCalendarAlt,
  FaClock,
  FaLanguage,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { movieAPI } from "../services/api";
import MovieCard from "../components/Movies/MovieCard";
import MovieSkeleton from "../components/Skeletons/MovieSkeleton";
import { useNavigate } from "react-router";

const MoviesPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { darkMode } = useTheme();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("title");
  const [userWatchlist, setUserWatchlist] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const genres = [
    "Action",
    "Drama",
    "Comedy",
    "Thriller",
    "Romance",
    "Sci-Fi",
    "Adventure",
    "Horror",
    "Fantasy",
    "Biography",
  ];

  const languages = ["English", "Nepali", "Hindi"];

  const categories = [
    { value: "all", label: t("सबै चलचित्रहरू", "All Movies") },
    { value: "now-showing", label: t("अहिले देखाइँदै", "Now Showing") },
    { value: "coming-soon", label: t("आउँदै", "Coming Soon") },
    // { value: "latest", label: t("नवीनतम रिलिजहरू", "Latest Releases") },
  ];

  const sortOptions = [
    { value: "title", label: t("शीर्षक", "Title") },
    { value: "rating", label: t("रेटिङ", "Rating") },
    { value: "releaseDate", label: t("रिलिज मिति", "Release Date") },
    { value: "duration", label: t("अवधि", "Duration") },
  ];

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      let endpoint = "/movies";
      const params = new URLSearchParams();

      if (selectedCategory !== "all") {
        switch (selectedCategory) {
          case "now-showing":
            params.append("isNowShowing", "true");
            break;
          case "coming-soon":
            params.append("isComingSoon", "true");
            break;
          // case "latest":
          //   params.append("isLatest", "true");
          //   break;
        }
      }

      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const response = await movieAPI.getMovies(endpoint);
      setMovies(response.data || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
      showToast(
        t("चलचित्रहरू लोड गर्न असफल", "Failed to fetch movies"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, showToast, t]);

  // Fetch user watchlist
  const fetchUserWatchlist = useCallback(async () => {
    if (!user) return;
    try {
      const response = await movieAPI.getMyWatchlist();
      setUserWatchlist(response.data?.map((item) => item.movie._id) || []);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    }
  }, [user]);

  // Handle watchlist toggle
  const handleWatchlistToggle = async (movieId) => {
    if (!user) {
      showToast(
        t(
          "कृपया वाचलिस्टमा थप्न लगइन गर्नुहोस्",
          "Please login to add movies to watchlist"
        ),
        "error"
      );
      return;
    }

    try {
      const isInWatchlist = userWatchlist.includes(movieId);

      if (isInWatchlist) {
        await movieAPI.removeFromWatchlist(movieId);
        setUserWatchlist((prev) => prev.filter((id) => id !== movieId));
        showToast(
          t("चलचित्र वाचलिस्टबाट हटाइयो", "Movie removed from watchlist"),
          "success"
        );
      } else {
        await movieAPI.addToWatchlist(movieId);
        setUserWatchlist((prev) => [...prev, movieId]);
        showToast(
          t("चलचित्र वाचलिस्टमा थपियो", "Movie added to watchlist"),
          "success"
        );
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      showToast(
        t("वाचलिस्ट अपडेट गर्न असफल", "Failed to update watchlist"),
        "error"
      );
    }
  };

  // Handle booking
  const handleBooking = (movieId) => {
    if (!user) {
      showToast(
        t("कृपया टिकट बुक गर्न लगइन गर्नुहोस्", "Please login to book tickets"),
        "error"
      );
      return;
    }
    navigate(`/booking/${movieId}`);
  };

  // Handle notify me for coming soon movies
  const handleNotifyMe = async (movieId) => {
    if (!user) {
      showToast(
        t(
          "कृपया सूचना प्राप्त गर्न लगइन गर्नुहोस्",
          "Please login to get notifications"
        ),
        "error"
      );
      return;
    }
    await handleWatchlistToggle(movieId);
  };

  // Filter and sort movies
  useEffect(() => {
    let filtered = [...movies];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movie.titleNepali?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movie.genre.some((g) =>
            g.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          movie.cast.some((actor) =>
            actor.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          movie.director.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Genre filter
    if (selectedGenre !== "all") {
      filtered = filtered.filter((movie) =>
        movie.genre.includes(selectedGenre)
      );
    }

    // Language filter
    if (selectedLanguage !== "all") {
      filtered = filtered.filter(
        (movie) => movie.language === selectedLanguage
      );
    }

    // Sort movies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "rating":
          return (b.userScore?.average || 0) - (a.userScore?.average || 0);
        case "releaseDate":
          return new Date(b.releaseDate) - new Date(a.releaseDate);
        case "duration":
          return b.duration - a.duration;
        default:
          return 0;
      }
    });

    setFilteredMovies(filtered);
  }, [movies, searchTerm, selectedGenre, selectedLanguage, sortBy]);

  // Load data on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMovies();
    fetchUserWatchlist();
  }, [fetchMovies, fetchUserWatchlist]);

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} ${
        darkMode ? "text-white" : "text-gray-900"
      }`}
    >
      {/* Hero Section */}
      <div
        className={`relative ${
          darkMode
            ? "bg-gradient-to-r from-purple-900 via-blue-900 to-gray-900"
            : "bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600"
        } py-12 sm:py-16 md:py-20 rounded-3xl drop-shadow-md`}
      >
        <div className="absolute inset-0 ${darkMode ? 'bg-black/30' : 'bg-white/10'}`"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 animate-fade-in text-white drop-shadow-2xl">
            {t("अद्भुत चलचित्रहरू खोज्नुहोस्", "Discover Amazing Movies")}
          </h1>
          <p
            className={`text-base sm:text-lg md:text-xl mb-6 sm:mb-8 animate-slide-in-from-bottom ${
              darkMode ? "text-gray-300" : "text-white/90 drop-shadow"
            }`}
          >
            {t(
              "नवीनतम ब्लकबस्टर र आगामी रिलिजहरूका लागि टिकटहरू बुक गर्नुहोस्",
              "Book tickets for the latest blockbusters and upcoming releases"
            )}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative animate-slide-in-from-bottom stagger-1">
            <FaSearch
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            />{" "}
            <input
              type="text"
              placeholder={t(
                "चलचित्र, विधा, कलाकार, निर्देशक खोज्नुहोस्...",
                "Search movies, genres, actors, directors..."
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl backdrop-blur-md transition-all ${
                darkMode
                  ? "bg-white/10 text-white placeholder-gray-300 border-white/20 hover:bg-white/15"
                  : "bg-white/95 text-gray-800 placeholder-gray-500 border-white/50 hover:bg-white shadow-lg"
              } border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                  selectedCategory === category.value
                    ? "bg-purple-600 text-white"
                    : `${
                        darkMode
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-200 hover:bg-gray-300"
              } rounded-lg transition-all text-sm sm:text-base`}
            >
              <FaFilter />
              <span className="hidden sm:inline">
                {t("फिल्टरहरू", "Filters")}
              </span>
            </button>

            {/* View Mode Toggle */}
            <div
              className={`flex ${
                darkMode ? "bg-gray-800" : "bg-gray-200"
              } rounded-lg p-1`}
            >
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-purple-600 text-white"
                    : `${
                        darkMode
                          ? "text-gray-400 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`
                }`}
                aria-label={t("ग्रिड दृश्य", "Grid view")}
              >
                <FaTh />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list"
                    ? "bg-purple-600 text-white"
                    : `${
                        darkMode
                          ? "text-gray-400 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`
                }`}
                aria-label={t("सूची दृश्य", "List view")}
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } rounded-xl p-4 sm:p-6 mb-6 animate-slide-in-from-top shadow-lg`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Genre Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("विधा", "Genre")}
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className={`w-full px-3 py-2 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-900"
                  } border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="all">{t("सबै विधाहरू", "All Genres")}</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("भाषा", "Language")}
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className={`w-full px-3 py-2 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-900"
                  } border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="all">
                    {t("सबै भाषाहरू", "All Languages")}
                  </option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("क्रमबद्ध गर्नुहोस्", "Sort By")}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full px-3 py-2 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-900"
                  } border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedGenre("all");
                    setSelectedLanguage("all");
                    setSortBy("title");
                    setSearchTerm("");
                  }}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                >
                  {t("फिल्टरहरू खाली गर्नुहोस्", "Clear Filters")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p
            className={`${
              darkMode ? "text-gray-400" : "text-gray-600"
            } text-sm sm:text-base`}
          >
            {loading
              ? t("लोड हुँदैछ...", "Loading...")
              : t(
                  `${filteredMovies.length} चलचित्रहरू फेला परे`,
                  `${filteredMovies.length} movies found`
                )}
          </p>
        </div>

        {/* Movies Grid/List */}
        {loading ? (
          <div
            className={`grid gap-4 sm:gap-6 ${
              viewMode === "grid"
                ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : "grid-cols-1"
            }`}
          >
            {[...Array(10)].map((_, i) => (
              <MovieSkeleton key={i} viewMode={viewMode} />
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="text-5xl sm:text-6xl mb-4 opacity-50">🎬</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              {t("कुनै चलचित्र फेला परेन", "No movies found")}
            </h3>
            <p
              className={`${darkMode ? "text-gray-400" : "text-gray-600"} mb-6`}
            >
              {t(
                "तपाईंको खोज वा फिल्टरहरू समायोजन गर्ने प्रयास गर्नुहोस्",
                "Try adjusting your search or filters"
              )}
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedGenre("all");
                setSelectedLanguage("all");
                setSelectedCategory("all");
              }}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
            >
              {t("सबै फिल्टरहरू खाली गर्नुहोस्", "Clear All Filters")}
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-4 sm:gap-6 ${
              viewMode === "grid"
                ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : "grid-cols-1"
            }`}
          >
            {filteredMovies.map((movie, index) => (
              <div
                key={movie._id}
                className={`animate-scale-in stagger-${(index % 5) + 1}`}
              >
                <MovieCard
                  movie={movie}
                  viewMode={viewMode}
                  isInWatchlist={userWatchlist.includes(movie._id)}
                  onWatchlistToggle={() => handleWatchlistToggle(movie._id)}
                  onBookTickets={() => handleBooking(movie._id)}
                  onNotifyMe={() => handleNotifyMe(movie._id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
