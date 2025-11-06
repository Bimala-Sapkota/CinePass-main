import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { FaStar } from "react-icons/fa";
import MovieSkeleton from "../Skeletons/MovieSkeleton";
import { useMemo } from "react";
import useSkeletonCount from "../../hooks/useSkeletonCount";
import { useLanguage } from "../../context/LanguageContext";
import api from "../../services/api";
import { Link } from "react-router";
import { formatDuration, getImageUrl } from "../../services/utils";
import useAnimateOnScroll from "../../hooks/useAnimateOnScroll";
import { useToast } from "../../context/ToastContext";
import AnimatedSection from "../common/AnimatedSection";

const MovieCard = ({
  movie,
  currentTab,
  t,
  darkMode,
  isNotified,
  onNotifyClick,
}) => {
  return (
    <Link
      to={`/movies/${movie._id}`}
      className={`rounded-xl overflow-hidden ${
        darkMode ? "bg-gray-800" : "bg-white"
      } shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03] cursor-pointer
      `}
      style={{ animationDelay: `${(movie.index || 0) * 100}ms` }}
    >
      {/* Movie Poster */}
      <div className="relative h-[320px] md:h-[350px] lg:h-[400px] overflow-hidden">
        <img
          src={getImageUrl(movie.posterImage, "/default-poster.jpg")}
          alt={t(movie.titleNepali, movie.title)}
          className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-110"
        />
        <div
          className="absolute top-3 right-3 bg-black/70 text-white text-xs
                font-semibold px-2 py-1 rounded "
        >
          {formatDuration(movie.duration)}
        </div>
        {/* Rating */}
        {movie.userScore?.average && (
          <div className="absolute bottom-3 left-3 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
            <FaStar />
            {movie.userScore.average.toFixed(1)}
          </div>
        )}
        {/* Coming Soon Tag */}
        {currentTab === "coming" && (
          <div className="absolute bottom-3 left-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
            {t("शीघ्र आउँदै", "Coming Soon")}
          </div>
        )}
      </div>

      {/* Movie details */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 truncate">
          {t(movie.titleNepali, movie.title)}
        </h3>
        <p
          className={`text-sm ${
            darkMode ? "text-gray-400" : "text-gray-600"
          } mb-3 truncate`}
        >
          {movie.genre.join(", ")}
        </p>
        {currentTab === "isComingSoon" ? (
          <button
            onClick={onNotifyClick}
            disabled={isNotified}
            className={`w-full py-2 rounded-full font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              isNotified
                ? "bg-green-600 text-white cursor-not-allowed"
                : darkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {isNotified ? (
              <>✔️ {t("सूचित गरियो", "Notifying")}</>
            ) : (
              t("सूचित गर्नुहोस्", "Notify Me")
            )}
          </button>
        ) : (
          <button
            className={`w-full py-2 rounded-full font-medium text-sm transition-colors duration-300 bg-purple-600 hover:bg-purple-700 text-white`}
          >
            {t("टिकट बुक गर्नुहोस्", "Book Tickets")}
          </button>
        )}
      </div>
    </Link>
  );
};

function MovieCategories() {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const skeletonCount = useSkeletonCount();

  const observerRef = useRef();
  const [visibleMovies, setVisibleMovies] = useState(8);

  const [currentTab, setCurrentTab] = useState("isNowShowing");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifiedMovies, setNotifiedMovies] = useState(new Set());

  const movieCategories = useMemo(
    () => [
      { id: "isNowShowing", name: t("हाल देखाइँदै", "Now Showing") },
      // { id: "isLatest", name: t("हालै रिलिज", "Latest Release") },
      { id: "isComingSoon", name: t("शीघ्र आउँदै", "Coming Soon") },
    ],
    [t]
  );

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/movies?${currentTab}=true`, {
          signal,
        });
        if (response.data && response.data.data) {
          setMovies(response.data.data);
        }
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error(`Failed to fetch ${currentTab} movies:`, error);
          showToast(
            t("चलचित्र लोड गर्न सकिएन", "Failed to load movies"),
            "error"
          );
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    fetchMovies();
    return () => {
      controller.abort();
    };
  }, [currentTab, showToast, t]);

  const handleNotifyClick = async (e, movieId) => {
    e.preventDefault();
    e.stopPropagation();

    setNotifiedMovies((prev) => new Set(prev).add(movieId));

    try {
      await api.post("/watchlist", { movieId });

      setNotifiedMovies((prev) => new Set(prev).add(movieId));
      showToast(
        t("सूचना प्राप्त हुनेछ!", "We'll notify you when it's available!"),
        "success"
      );
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      showToast(t("त्रुटि भयो", "Something went wrong"), "error");
    }
  };

  const lastMovieElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && visibleMovies < movies.length) {
          setVisibleMovies((prev) => Math.min(prev + 4, movies.length));
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, visibleMovies, movies.length]
  );

  return (
    <>
      <section className="mt-5 mb-12  px-4 sm:px-10 lg:px-10">
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold">{t("चलचित्रहरू", "Movies")}</h2>
          <div
            className={`flex p-1 justify-around rounded-full border ${
              darkMode ? "border-gray-700" : "border-gray-200"
            } transition-colors duration-300 overflow-x-auto gap-2 no-scrollbar `}
            role="tablist"
          >
            {movieCategories.map((category) => (
              <button
                key={category.id}
                role="tab"
                onClick={() => {
                  setCurrentTab(category.id);
                  setVisibleMovies(8);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                  currentTab === category.id
                    ? darkMode
                      ? "bg-purple-600 text-white"
                      : "bg-purple-100 text-purple-800"
                    : darkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                } cursor-pointer `}
              >
                {t(
                  // category.id === "latest"
                  //   ? "हालै रिलिज"
                    // :
                     category.id === "coming"
                    ? "शीघ्र आउँदै"
                    : "हाल देखाइँदै",
                  category.name
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Movies List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {isLoading ? (
            Array.from({ length: skeletonCount }).map((_, i) => (
              <MovieSkeleton key={i} />
            ))
          ) : movies.length > 0 ? (
            movies.slice(0, visibleMovies).map((movie, index) => (
              <AnimatedSection
                key={movie._id}
                animation="slideUp"
                delay={index * 100}
                className="h-full"
              >
                <MovieCard
                  movie={{ ...movie, index }}
                  currentTab={currentTab}
                  t={t}
                  darkMode={darkMode}
                  isNotified={notifiedMovies.has(movie._id)}
                  onNotifyClick={(e) => handleNotifyClick(e, movie._id)}
                />
              </AnimatedSection>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p
                className={`text-lg ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {t("कुनै चलचित्र फेला परेन", "No movies found")}
              </p>
            </div>
          )}
        </div>

        {!isLoading && movies.length > visibleMovies && (
          <div className="text-center mt-8">
            <button
              onClick={() =>
                setVisibleMovies((prev) => Math.min(prev + 4, movies.length))
              }
              className={`px-6 py-3 rounded-full font-medium transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              {t("थप हेर्नुहोस्", "Load More")}
            </button>
          </div>
        )}
      </section>
    </>
  );
}

export default MovieCategories;
