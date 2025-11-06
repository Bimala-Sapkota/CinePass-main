import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
  FaStar,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";
import { FaTicket } from "react-icons/fa6";
import { useLanguage } from "../../context/LanguageContext";
import api from "../../services/api.jsx";
import { Link, useNavigate } from "react-router";
import { formatDuration } from "../../services/utils.js";
import { getImageUrl } from "./../../services/utils";

function FeaturedMovies() {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchfeaturedMovies = async () => {
      setLoading(true);
      try {
        const response = await api.get("/movies?featured=true", { signal });
        if (response.data && response.data.data) {
          setFeatured(response.data.data);
        }
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("Failed to fetch featured movies:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchfeaturedMovies();
    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (featured.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featured.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [featured]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (loading || featured.length === 0) {
    return (
      <section
        className={`h-[70vh] sm:h-[80vh] lg:h-[85vh] w-full relative rounded-xl overflow-hidden mt-4 shadow-lg ${
          darkMode ? "bg-gray-800`" : "bg-gray-200"
        }`}
      >
        <div className="absolute z-20 h-full flex flex-col justify-end md:justify-center px-4 sm:px-6 md:px-12 pb-20 md:pb-0">
          <div className="max-w-xlzz animate-pulse">
            <div className="h-8 sm:h-10 lg:h-12 bg-gray-500/30 rounded w-3/4 mb-4 loading-shimmer"></div>
            <div className="h-4 sm:h-6 bg-gray-500/30 rounded w-1/2 mb-6 loading-shimmer"></div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="h-10 sm:h-12 bg-gray-500/30 rounded-full w-32 loading-shimmer"></div>
              <div className="h-10 sm:h-12 bg-gray-500/30 rounded-full w-32 loading-shimmer"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentMovie = featured[currentIndex];

  return (
    <section className="h-[70vh] sm:h-[80vh] lg:h-[85vh] w-full relative rounded-xl overflow-hidden mt-4 shadow-2xl">
      <div className="absolute inset-0 z-0">
        {featured.map((movie, index) => (
          <img
            key={movie._id}
            src={getImageUrl(movie.bannerImage || movie.posterImage)}
            alt={movie.title}
            className={`w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              movie._id === currentMovie._id
                ? "opacity-100 animate-ken-burns"
                : "opacity-0"
            } `}
            loading={index === currentIndex ? "eager" : "lazy"}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 to-transparent z-10"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 h-full flex flex-col justify-end md:justify-center px-4 sm:px-6 md:px-12 pb-20 md:pb-0">
        <div
          key={currentMovie._id}
          className="max-w-xl text-white animate-slide-in-from-bottom duration-700"
        >
          {/* Movie Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold text-white mb-3 leading-tight drop-shadow-2xl animate-slide-in-from-bottom duration-700">
            {t(currentMovie.titleNepali, currentMovie.title)}
          </h2>

          {/* Enhanced Movie Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-6 text-white/80 text-xs sm:text-sm animate-slide-in-from-bottom duration-700 delay-100">
            {currentMovie.userScore?.average > 0 && (
              <span className="text-yellow-400 flex items-center gap-1">
                <FaStar />
                {currentMovie.userScore.average.toFixed(1)}
              </span>
            )}
            <span className="bg-white/20 px-2 py-1 rounded text-xs font-semibold">
              {currentMovie.certification || "U/A"}
            </span>
            <span className="hidden sm:inline">
              {currentMovie.genre?.slice(0, 2).join(", ") || "N/A"}
            </span>
            <span className="flex items-center gap-1">
              <FaClock className="text-xs" />
              {formatDuration(currentMovie.duration)}
            </span>
          </div>

          {/* Description */}
          <p className="hidden md:block text-white/90 mb-6 line-clamp-3 lg:text-lg leading-relaxed animate-slide-in-from-bottom duration-700 delay-200">
            {t(currentMovie.descriptionNepali, currentMovie.description)}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 animate-slide-in-from-bottom duration-700 delay-300">
            <Link
              // to={`/booking/${currentMovie._id}`}
              to={`/movies/${currentMovie._id}`}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FaTicket />
              <span>{t("बुक टिकट", "Book Tickets")}</span>
            </Link>

            {currentMovie.trailerUrl && (
              <button
                onClick={() => window.open(currentMovie.trailerUrl, "_blank")}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-semibold backdrop-blur-sm transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FaPlay />
                <span>{t("ट्रेलर हेर्नुहोस्", "Watch Trailer")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Controls */}
      <div className="absolute z-25 bottom-0 left-0 right-0 p-3 sm:p-4">
        <div className="flex items-center justify-between text-white max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Navigation Arrows */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={goToPrev}
              className="group p-3 sm:p-4 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md transition-all duration-300 hover:scale-110 border border-white/20 hover:border-white/40"
            >
              <FaChevronLeft className="text-sm sm:text-base group-hover:-translate-x-1 transition-transform duration-300" />
            </button>
            <button
              onClick={goToNext}
              className="group p-3 sm:p-4 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md transition-all duration-300 hover:scale-110 border border-white/20 hover:border-white/40"
            >
              <FaChevronRight className="text-sm sm:text-base group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          {/* Movie Counter */}
          <div className="font-mono text-sm sm:text-lg">
            <span>{(currentIndex + 1).toString().padStart(2, "0")}</span>
            <span className="mx-2 opacity-50">/</span>
            <span className="opacity-50">
              {featured.length.toString().padStart(2, "0")}
            </span>
          </div>

          {/* Movie Thumbnails */}
          <div className="hidden md:flex items-center sm:gap-2 gap-3">
            {featured.map((movie, index) => (
              <button
                key={movie._id}
                onClick={() => goToSlide(index)}
                className="group rounded-lg overflow-hidden outline-none ring-2 ring-transparent focus-visible:ring-purple-500 transition-all duration-300 hover:scale-105"
              >
                <img
                  src={getImageUrl(movie.posterImage)}
                  alt={movie.title}
                  className={`w-12 sm:w-16 h-16 sm:h-24 object-cover transition-all duration-300 ${
                    index === currentIndex
                      ? "opacity-100 scale-105 ring-2 ring-white shadow-lg"
                      : "opacity-60 hover:opacity-80 group-hover:scale-105"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedMovies;
