import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { FaStar } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { useState } from "react";
import { useEffect } from "react";
import useAnimateOnScroll from "../../hooks/useAnimateOnScroll";
import MovieCardSkeleton from "../Skeletons/MovieCardSkeleton";
import { formatDuration, getImageUrl } from "../../services/utils";
import { Link, useNavigate } from "react-router";

function RecommendationSection() {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [titleRef, isTitleVisible] = useAnimateOnScroll({ threshold: 0.5 });
  const [gridRef, isGridVisible] = useAnimateOnScroll({ threshold: 0.1 });

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data } = await api.get("/recommendations");

        if (data.success && data.data.length > 0) {
          setRecommendedMovies(data.data);
        } else {
          const fallbackResponse = await api.get(
            "/movies?featured=true&limit=3"
          );
          setRecommendedMovies(fallbackResponse.data.data || []);
        }
      } catch (error) {
        console.error(
          "Failed to fetch recommendations, fetching fallback:",
          error
        );
        try {
          const fallbackResponse = await api.get(
            "/movies?featured=true&limit=3"
          );
          setRecommendedMovies(fallbackResponse.data.data || []);
        } catch (fallbackError) {
          console.error("Failed to fetch fallback movies:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const fetchUserPreferences = async () => {
      if (!user) return;

      try {
        const { data } = await api.get("/recommendations/preferences", {
          signal,
        });
        console.log("User preferences:", data);
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("Failed to fetch user preferences:", error);
        }
      }
    };
    fetchUserPreferences();
    return () => {
      controller.abort();
    };
  }, [user]);

  if (loading) {
    return (
      <section className="mb-12 px-10">
        <div
          className={`h-8 w-1/2 animate-pulse  ${
            darkMode ? "bg-gray-700" : "bg-gray-300"
          } rounded mb-6`}
        ></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  if (recommendedMovies.length === 0) {
    return (
      <section className="mb-12 px-10">
        <h2 className="text-2xl font-bold mb-6">
          {t("तपाईंको लागि सिफारिस", "Recommended For You")}
        </h2>
        <div
          className={`text-center py-8 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <p>
            {t(
              "अहिले कुनै सिफारिस छैन",
              "No recommendations available right now"
            )}
          </p>
          <p className="text-sm mt-2">
            {t(
              "केही चलचित्र हेरेपछि हामी तपाईंलाई राम्रो सिफारिस दिनेछौं",
              "Watch some movies and we'll provide better recommendations"
            )}
          </p>
        </div>
      </section>
    );
  }
  return (
    <section className="mb-12 px-4 sm:px-10">
      <h2
        ref={titleRef}
        className={`text-2xl md:text-3xl font-bold mb-6 transition-all duration-700
        ${
          isTitleVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-5"
        }`}
      >
        {t("तपाईंको लागि सिफारिस", "Recommended For You")}
      </h2>
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {recommendedMovies.map((movie, index) => (
          <div
            key={movie._id}
            onClick={() => navigate(`movies/${movie._id}`)}
            className={`rounded-xl overflow-hidden ${
              darkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg flex flex-col md:flex-row cursor-pointer
            transform hover:-translate-y-2 transition-all duration-300
            ${isGridVisible ? "animate-fade-in-up" : "opacity-0"}
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Movie Poster */}
            <div className="md:w-1/3 w-full h-48 md:h-auto">
              <img
                src={`${getImageUrl(movie.posterImage)}`}
                alt={`Poster of ${movie.title}`}
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Movie Info */}
            <div className="md:w-2/3 w-full p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1 line-clamp-2">
                  {" "}
                  {t(movie.titleNepali, movie.title)}
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  } mb-1`}
                >
                  {movie.genre.join(", ")}
                </p>
                <div className="flex items-center space-x-2 mb-3">
                  {movie.userScore?.average > 0 && (
                    <span className="text-yellow-500 flex items-center text-sm">
                      <FaStar className="mr-1" />
                      {movie.userScore.average.toFixed(1)}
                    </span>
                  )}
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {formatDuration(movie.duration)}
                  </span>
                </div>

                {movie.reason && (
                  <p
                    className={`text-xs ${
                      darkMode ? "text-gray-500" : "text-gray-500"
                    } mb-2 italic`}
                  >
                    {t(movie.reasonNepali, movie.reason)}
                  </p>
                )}
              </div>

              <Link
                to={`/booking/${movie._id}`}
                className={`py-2 px-4 rounded-full font-medium text-sm text-center ${
                  darkMode
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                } transition-colors duration-300`}
                onClick={(e) => e.stopPropagation()}
              >
                {t("बुक गर्नुहोस्", "Book Now")}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecommendationSection;
