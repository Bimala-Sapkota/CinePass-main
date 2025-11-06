import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Link, useNavigate } from "react-router";
import api from "../../services/api";
import { FaHistory, FaSearch, FaSpinner, FaTimes } from "react-icons/fa";
import { getImageUrl } from "./../../services/utils";
import useDebounce from "../../hooks/useDebounce";
import { useLanguage } from "../../context/LanguageContext";

function SearchBar({ placeholder, onSearch, onResultClick }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  const saveRecentSearch = useCallback(
    (searchTerm) => {
      const updated = [
        searchTerm,
        ...recentSearches.filter((s) => s !== searchTerm),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("cinepass-recent-searches", JSON.stringify(updated));
    },
    [recentSearches]
  );

  useEffect(() => {
    const saved = localStorage.getItem("cinepass-recent-searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsDropdownOpen(true);
    setIsLoading(true);

    const searchMovies = async () => {
      try {
        const response = await api.get(`/movies?search=${debouncedQuery}`);
        setResults(response.data.data || []);
      } catch (error) {
        console.error("Search API failed:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchMovies();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      const totalItems = results.length + recentSearches.length;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0) {
            if (activeIndex < results.length) {
              const movie = results[activeIndex];
              handleMovieSelect(movie);
            } else {
              const recentIndex = activeIndex - results.length;
              const recentSearch = recentSearches[recentIndex];
              setQuery(recentSearch);
              handleSearch(recentSearch);
            }
          } else if (query.trim()) {
            handleSearch(query);
          }
          break;
        case "Escape":
          setIsDropdownOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [results, recentSearches, activeIndex, query]
  );

  const handleMovieSelect = (movie) => {
    saveRecentSearch(movie.title);
    setQuery("");
    setIsDropdownOpen(false);
    setActiveIndex(-1);
    navigate(`/movies/${movie._id}`);
    if (onResultClick) {
      onResultClick();
    }
  };

  const handleSearch = (searchTerm) => {
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm);
      setQuery("");
      setIsDropdownOpen(false);
      setActiveIndex(-1);
      if (onSearch) {
        onSearch(searchTerm);
      }
      if (onResultClick) {
        onResultClick();
      }
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("cinepass-recent-searches");
  };

  return (
    <div
      className="relative w-full max-w-md mx-auto"
      ref={searchContainerRef}
      onKeyDown={handleKeyDown}
    >
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder={placeholder}
          className={`w-full py-3 pl-11 pr-10 text-sm rounded-full border transition-all ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500"
              : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-purple-600"
          } focus:outline-none focus:ring-2 focus:border-transparent`}
        />

        {isLoading ? (
          <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
        ) : (
          query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsDropdownOpen(false);
              }}
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 ${
                darkMode ? "hover:text-white" : "hover:text-gray-800"
              }`}
            >
              <FaTimes />
            </button>
          )
        )}
      </div>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div
          className={`absolute top-full mt-2 w-full z-50 rounded-lg shadow-xl border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } max-h-96 overflow-hidden`}
        >
          {/* Search Results */}
          {results.length > 0 && (
            <div>
              <div
                className={`px-4 py-2 text-xs font-semibold ${
                  darkMode
                    ? "text-gray-400 bg-gray-700"
                    : "text-gray-600 bg-gray-50"
                }`}
              >
                {t("खोज परिणामहरू", "Search Results")}
              </div>

              {results.map((movie, index) => (
                <button
                  key={movie._id}
                  onClick={() => handleMovieSelect(movie)}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                    activeIndex === index
                      ? darkMode
                        ? "bg-gray-700"
                        : "bg-gray-100"
                      : darkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <img
                    src={getImageUrl(movie.posterImage)}
                    alt={movie.title}
                    className="w-10 h-14 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {t(movie.titleNepali, movie.title)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {movie.director} • {movie.genre?.join(", ")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && !query && (
            <div>
              <div
                className={`px-4 py-2 text-xs font-semibold flex items-center justify-between ${
                  darkMode
                    ? "text-gray-400 bg-gray-700"
                    : "text-gray-600 bg-gray-50"
                }`}
              >
                <span>{t("हालैका खोजहरू", "Recent Searches")}</span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-purple-600 hover:text-purple-700"
                >
                  {t("सफा गर्नुहोस्", "Clear")}
                </button>
              </div>

              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search);
                    handleSearch(search);
                  }}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                    activeIndex === results.length + index
                      ? darkMode
                        ? "bg-gray-700"
                        : "bg-gray-100"
                      : darkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <FaHistory className="text-gray-400" />
                  <span className="truncate">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && query && results.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              {t(
                `"${query}" को लागि कुनै परिणाम फेला परेन`,
                `No results found for "${query}"`
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="p-4 flex items-center justify-center">
              <FaSpinner className="animate-spin mr-2" />
              <span className="text-sm text-gray-500">
                {t("खोजी हुँदैछ...", "Searching...")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
