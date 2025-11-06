import React, { useState, useEffect, useRef } from "react";
import {
  FaPlay,
  FaTimes,
  FaExpand,
  FaCompress,
  FaVolumeMute,
  FaVolumeUp,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { FiVideoOff } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import api from "../../services/api";
import { getImageUrl } from "../../services/utils";
import TrailerCardSkeleton from "../Skeletons/TrailerCardSkeleton";

const Trailers = ({ movieId = null, showAll = false, limit = 12 }) => {
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  const [trailers, setTrailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const loadTrailers = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          movieId ? `/movies/${movieId}` : "/movies",
          { signal }
        );
        const allMovies = Array.isArray(response.data.data)
          ? response.data.data
          : [response.data.data];
        const moviesWithTrailers = allMovies.filter(
          (movie) => movie && movie.trailerUrl
        );

        const formattedTrailers = moviesWithTrailers.map((movie) => ({
          id: movie._id,
          movieTitle: t(movie.titleNepali, movie.title),
          trailerUrl: movie.trailerUrl,
          thumbnailUrl: getImageUrl(movie.bannerImage || movie.posterImage),
          duration: `${Math.floor(movie.duration / 60)}:${(movie.duration % 60)
            .toString()
            .padStart(2, "0")}`,
          isNew: movie.isLatest,
        }));

        setTrailers(
          showAll ? formattedTrailers : formattedTrailers.slice(0, limit)
        );
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("Failed to load trailers from backend:", error);
          setTrailers([]);
        }
        setTrailers([]);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };
    loadTrailers();
    return () => {
      controller.abort();
    };
  }, [movieId, showAll, limit, t]);

  const handleTrailerClick = (trailer) => {
    setSelectedTrailer(trailer);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setSelectedTrailer(null);
    document.body.style.overflow = "auto";
  };

  const scroll = (direction) => {
    const { current } = scrollContainerRef;
    if (current) {
      const scrollAmount = current.offsetWidth * 0.8;
      current.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full py-8 relative group/section">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2
          className={`text-2xl font-bold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {t("नवीनतम ट्रेलरहरू", "Latest Trailers")}
        </h2>
      </div>

      {loading ? (
        <div className="flex space-x-6 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full md:w-1/3 lg:w-1/4 shrink-0">
              <TrailerCardSkeleton />
            </div>
          ))}
        </div>
      ) : trailers.length > 0 ? (
        <div className="relative">
          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"
          >
            {trailers.map((trailer, index) => (
              <div
                key={trailer.id}
                className="w-[80vw] sm:w-[40vw] md:w-[30vw] lg:w-[24vw] xl:w-[20vw] shrink-0"
              >
                <TrailerCard
                  trailer={trailer}
                  onClick={() => handleTrailerClick(trailer)}
                  index={index}
                />
              </div>
            ))}
          </div>

          {/* Desktop Scroll Buttons */}
          <button
            onClick={() => scroll(-1)}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12  ${
              darkMode
                ? "bg-gray-800/80 text-white"
                : "bg-white/80 text-gray-800"
            } backdrop-blur-sm rounded-full shadow-lg items-center justify-center  opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 hover:scale-110 z-10 hidden md:flex`}
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={() => scroll(1)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12  ${
              darkMode
                ? "bg-gray-800/80 text-white"
                : "bg-white/80 text-gray-800"
            } backdrop-blur-sm rounded-full shadow-lg items-center justify-center  opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 hover:scale-110 z-10 hidden md:flex`}
          >
            <FaChevronRight />
          </button>
        </div>
      ) : (
        <div
          className={`text-center py-16 rounded-xl ${
            darkMode ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <FiVideoOff
            className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? "text-gray-600" : "text-gray-400"
            }`}
          />
          <h3 className="text-xl font-semibold">
            {t("कुनै ट्रेलर फेला परेन", "No Trailers Found")}
          </h3>
        </div>
      )}

      {selectedTrailer && (
        <TrailerModal trailer={selectedTrailer} onClose={handleCloseModal} />
      )}
    </section>
  );
};

// Trailer Card Component
const TrailerCard = ({ trailer, onClick, index }) => {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="group cursor-pointer rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
      onClick={onClick}
    >
      <div className={`relative ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="relative aspect-video overflow-hidden">
          {!imageError ? (
            <img
              src={trailer.thumbnailUrl}
              alt={`${trailer.movieTitle} trailer`}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center ${
                darkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <FaPlay
                className={`text-4xl ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
            </div>
          )}
          {!imageLoaded && !imageError && (
            <div
              className={`absolute inset-0 ${
                darkMode ? "bg-gray-700" : "bg-gray-300"
              } overflow-hidden`}
            >
              <div className="absolute inset-0 loading-shimmer"></div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 group-hover:shadow-purple-500/50 transition-all duration-300">
              <FaPlay className="text-white text-xl ml-1" />
            </div>
          </div>
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/50 to-transparent"></div>
          {trailer.isNew && (
            <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded font-bold shadow-md">
              NEW
            </div>
          )}
          {trailer.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {trailer.duration}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3
            className={`font-semibold truncate ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {trailer.movieTitle}
          </h3>
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("आधिकारिक ट्रेलर", "Official Trailer")}
          </p>
        </div>
      </div>
    </div>
  );
};

// Trailer Modal Component
const TrailerModal = ({ trailer, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef(null);
  const { darkMode } = useTheme();
  const youtubeId = trailer.trailerUrl?.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
  )?.[1];

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-4xl mx-auto aspect-video ${
          isClosing ? "animate-scale-out" : "animate-scale-in"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className={`absolute -top-10 right-0 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center ${
            darkMode ? "hover:bg-white/20" : "hover:bg-black/20"
          } transition-colors z-20`}
          title="Close"
        >
          <FaTimes />
        </button>

        <div className="w-full h-full bg-black rounded-lg overflow-hidden shadow-2xl shadow-purple-500/30">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`${trailer.movieTitle} - Official Trailer`}
            />
          ) : (
            <p className="text-white flex items-center justify-center h-full">
              Invalid Trailer URL
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trailers;
