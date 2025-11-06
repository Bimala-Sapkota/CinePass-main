import React from "react";
import {
  FaHeart,
  FaPlay,
  FaBell,
  FaStar,
  FaCalendarAlt,
  FaClock,
  FaLanguage,
} from "react-icons/fa";
import { Link } from "react-router";
import { formatDuration, getImageUrl } from "../../services/utils";
import { formatDate } from "./../../services/utils";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

const MovieCard = ({
  movie,
  viewMode = "grid",
  isInWatchlist = false,
  onWatchlistToggle,
  onBookTickets,
  onNotifyMe,
}) => {
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  const getStatusInfo = () => {
    if (movie.isNowShowing) {
      return {
        status: t("अहिले देखाइँदै", "Now Showing"),
        color: "bg-green-600",
        action: onBookTickets,
        icon: FaPlay,
        text: t("टिकट बुक गर्नुहोस्", "Book Tickets"),
      };
    } else if (movie.isComingSoon) {
      return {
        status: t("आउँदै", "Coming Soon"),
        color: "bg-yellow-600",
        action: onNotifyMe,
        icon: FaBell,
        text: t("सूचना पाउनुहोस्", "Notify Me"),
      };
    } else {
      return {
        status: t("उपलब्ध", "Available"),
        color: "bg-blue-600",
        action: onBookTickets,
        icon: FaPlay,
        text: t("टिकट बुक गर्नुहोस्", "Book Tickets"),
      };
    }
  };

  const statusInfo = getStatusInfo();
  const ActionIcon = statusInfo.icon;

  const posterUrl = getImageUrl(movie.posterImage?.url || movie.posterImage);

  if (viewMode === "list") {
    return (
      <div
        className={`${
          darkMode ? "bg-gray-800" : "bg-white"
        } rounded-xl overflow-hidden hover:${
          darkMode ? "bg-gray-750" : "bg-gray-50"
        } transition-all duration-300 group shadow-lg`}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Movie Poster */}
          <div className="relative w-full sm:w-32 h-48 sm:h-48 shrink-0">
            <img
              src={posterUrl}
              alt={t(movie.titleNepali, movie.title)}
              className="w-full h-full object-cover"
            />
            <div
              className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium text-white ${statusInfo.color}`}
            >
              {statusInfo.status}
            </div>
          </div>

          {/* Movie Details */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Link
                  to={`/movies/${movie._id}`}
                  className={`text-lg sm:text-xl font-bold ${
                    darkMode
                      ? "text-white hover:text-purple-400"
                      : "text-gray-900 hover:text-purple-600"
                  } transition-colors`}
                >
                  {t(movie.titleNepali, movie.title)}
                </Link>

                <p
                  className={`${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  } mt-1 text-sm`}
                >
                  {t(movie.titleNepali, movie.title)}
                </p>
              </div>

              {/* Wishlist Heart */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onWatchlistToggle?.(movie._id);
                }}
                className={`p-2 rounded-full transition-all ml-2 ${
                  isInWatchlist
                    ? "text-red-500 bg-red-500/20 hover:bg-red-500/30"
                    : `${
                        darkMode
                          ? "text-gray-400 hover:text-red-500"
                          : "text-gray-600 hover:text-red-500"
                      } hover:bg-red-500/20`
                }`}
              >
                <FaHeart
                  className={`text-lg ${isInWatchlist ? "animate-pulse" : ""}`}
                />
              </button>
            </div>

            {/* Movie Meta Info */}
            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm mb-3">
              {movie.userScore?.average && (
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {movie.userScore.average.toFixed(1)}
                  </span>
                </div>
              )}
              <div
                className={`flex items-center gap-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <FaClock />
                <span>{formatDuration(movie.duration)}</span>
              </div>
              <div
                className={`flex items-center gap-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <FaCalendarAlt />
                <span>{formatDate(movie.releaseDate)}</span>
              </div>
              <div
                className={`flex items-center gap-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {" "}
                <FaLanguage />
                <span>{movie.language}</span>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-3">
              {movie.genre.slice(0, 3).map((genre, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 ${
                    darkMode
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-200 text-gray-700"
                  } text-xs rounded-full`}
                >
                  {genre}
                </span>
              ))}
            </div>

            <p
              className={`${
                darkMode ? "text-gray-300" : "text-gray-700"
              } text-sm mb-4 line-clamp-2`}
            >
              {t(movie.descriptionNepali, movie.description)}
            </p>

            {/* Action Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                statusInfo.action?.(movie._id);
              }}
              className={`flex items-center gap-2 px-4 py-2 ${statusInfo.color} hover:opacity-90 text-white rounded-lg transition-all font-medium`}
            >
              <ActionIcon />
              {statusInfo.text}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div
      className={`relative ${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-xl overflow-hidden hover:${
        darkMode ? "bg-gray-750" : "bg-gray-50"
      } transition-all duration-300 group hover:scale-105 shadow-lg`}
    >
      {/* Movie Poster */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status Badge */}
        <div
          className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium text-white ${statusInfo.color}`}
        >
          {statusInfo.status}
        </div>

        {/* Wishlist Heart */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onWatchlistToggle?.(movie._id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all z-10 ${
            isInWatchlist
              ? "text-red-500 bg-red-500/20 hover:bg-red-500/30"
              : "text-gray-400 hover:text-red-500 hover:bg-white/20"
          }`}
        >
          <FaHeart
            className={`text-lg ${isInWatchlist ? "animate-pulse" : ""}`}
          />
        </button>

        {/* Action Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              statusInfo.action?.(movie._id);
            }}
            className={`flex items-center gap-2 px-6 py-3 ${statusInfo.color} hover:opacity-90 text-white rounded-lg transition-all font-medium transform translate-y-4 group-hover:translate-y-0`}
          >
            <ActionIcon />
            {statusInfo.text}
          </button>
        </div>
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <Link
          to={`/movies/${movie._id}`}
          className={`block text-base sm:text-lg font-bold ${
            darkMode
              ? "text-white hover:text-purple-400"
              : "text-gray-900 hover:text-purple-600"
          } transition-colors mb-2 line-clamp-1`}
        >
          {t(movie.titleNepali, movie.title)}
        </Link>

        <p
          className={`${
            darkMode ? "text-gray-400" : "text-gray-600"
          } text-xs sm:text-sm mb-2 line-clamp-1`}
        >
          {" "}
          {movie.genre.slice(0, 2).join(", ")}
        </p>

        {/* Rating and Duration */}
        <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
          {" "}
          {movie.userScore?.average && (
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-400" />
              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                {movie.userScore.average.toFixed(1)}
              </span>
            </div>
          )}
          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
            {formatDuration(movie.duration)}
          </span>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1">
          {movie.genre.slice(0, 2).map((genre, index) => (
            <span
              key={index}
              className={`px-2 py-1 ${
                darkMode
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-200 text-gray-700"
              } text-xs rounded-full`}
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
