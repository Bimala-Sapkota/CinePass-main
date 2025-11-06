import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { Link } from "react-router";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaFilm,
  FaStar,
} from "react-icons/fa";
import { getImageUrl } from "./../../services/utils";

function BookingHeader({ movie }) {
  const { t, language } = useLanguage();
  if (!movie) return null;

  const releaseDateFormatted = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString(
        language === "np" ? "ne-NP" : "en-US", 
        { year: "numeric", month: "long", day: "numeric" }
      )
    : t("उपलब्ध छैन", "N/A");
  return (
    <section className="mb-8 relative rounded-2xl overflow-hidden shadow-xl h-[300px] md:h-[350px] animate-fade-in-down">
      <div className="absolute inset-0 z-0">
        <img
          loading="lazy"
          src={getImageUrl(movie.bannerImage || movie.posterImage)}
          alt={t(movie.titleNepali, movie.title)}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40 z-10"></div>
      </div>

      <div className="relative z-20 h-full flex items-center p-4 md:p-6">
        <Link
          to={`/movies/${movie._id}`}
          className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-colors duration-300 cursor-pointer z-30"
          aria-label={t("Go back to movie details", "Go back to movie details")}
        >
          <FaArrowLeft size={18} />
        </Link>

        <div className="flex flex-col md:flex-row items-center md:items-end w-full">
          <div className="w-[120px] h-[180px] md:w-[150px] md:h-[225px] rounded-lg overflow-hidden shadow-lg border-2 md:border-4 border-white/20 flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            <img
              src={getImageUrl(movie.posterImage)}
              alt={t(movie.titleNepali, movie.title)}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-white text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 line-clamp-2">
              {t(movie.titleNepali, movie.title)}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-300 mb-2 sm:mb-3">
              {movie.userScore?.average > 0 && (
                <span className="flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  {movie.userScore.average.toFixed(1)}/5.0
                </span>
              )}
              <span className="flex items-center">
                <FaClock className="mr-1" />
                {movie.duration} {t("mins", "mins")}
              </span>
              <span className="flex items-center capitalize">
                <FaFilm className="mr-1" />
                {Array.isArray(movie.genre)
                  ? movie.genre.join(", ")
                  : movie.genre}
              </span>
              <span className="flex items-center">
                <FaCalendarAlt className="mr-1" />
                {releaseDateFormatted}
              </span>
            </div>

            <p className="text-gray-300 text-xs sm:text-sm max-w-xl line-clamp-2 md:line-clamp-3">
              {t(movie.descriptionNepali, movie.description)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BookingHeader;
