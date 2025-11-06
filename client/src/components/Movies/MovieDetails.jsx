import React, { useCallback } from "react";
import { useEffect } from "react";
import { Link, useParams } from "react-router";
import api from "../../services/api";
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import {
  FaClock,
  FaPlay,
  FaTicketAlt,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import {
  formatCastArray,
  formatTime,
  getImageUrl,
} from "./../../services/utils";
import { formatDate } from "./../../services/utils";
import MovieDetailsSkeleton from "../Skeletons/MovieDetailsSkeleton";
import StarRating from "../common/StarRating";
import ReviewSection from "../Reviews/ReviewSection";

function MovieDetails() {
  const { id: movieId } = useParams();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.get(`/movies/${movieId}/reviews`);
      setReviews(res.data.data);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
  }, [movieId]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const movieRes = await api.get(`/movies/${movieId}`);
        setMovie(movieRes.data.data);

        await fetchReviews();
      } catch (error) {
        console.error("Failed to fetch movie details or reviews", error);
        showToast(
          t("चलचित्र डाटा लोड गर्न सकिएन।", "Could not load movie data."),
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
    window.scrollTo(0, 0);
    fetchAllData();
  }, [movieId, showToast, t, fetchReviews]);

  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (!user || !movieId) return;

      try {
        const response = await api.get("/watchlist");
        const isMovieInWatchlist = response.data.data.some(
          (item) => item.movie._id === movieId
        );
        setIsInWatchlist(isMovieInWatchlist);
      } catch (error) {
        console.error("Failed to check watchlist status:", error);
      }
    };

    checkWatchlistStatus();
  }, [user, movieId]);

  const handleWatchlistToggle = async () => {
    if (!user) {
      showToast(
        t("कृपया पहिले लगइन गर्नुहोस्", "Please login first"),
        "warning"
      );
      return;
    }

    setWatchlistLoading(true);
    try {
      if (isInWatchlist) {
        await api.delete(`/watchlist/${movieId}`);
        setIsInWatchlist(false);
        showToast(t("वाचलिस्टबाट हटाइयो", "Removed from watchlist"), "success");
      } else {
        await api.post("/watchlist", { movieId });
        setIsInWatchlist(true);
        showToast(t("वाचलिस्टमा थपियो", "Added to watchlist"), "success");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        t("वाचलिस्ट अपडेट गर्न सकिएन", "Failed to update watchlist");
      showToast(message, "error");
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (userRating === 0) {
      showToast(
        t(
          "कृपया तारा मूल्याङ्कन चयन गर्नुहोस्।",
          "Please select a star rating."
        ),
        "warning"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: newReview } = await api.post(`/movies/${movieId}/reviews`, {
        rating: userRating,
        comment: userComment,
      });
      setReviews([newReview.data, ...reviews]);
      showToast(
        t("समीक्षा सफलतापूर्वक पेश गरियो!", "Review submitted successfully!"),
        "success"
      );
      setUserRating(0);
      setUserComment("");
    } catch (error) {
      const message =
        error.response?.data?.error ||
        t("समीक्षा पेश गर्न असफल भयो।", "Failed to submit review.");
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onReviewAdded = (newReview) => setReviews([newReview, ...reviews]);
  const onReviewUpdated = (updatedReview) => {
    setReviews(
      reviews.map((r) => (r._id === updatedReview._id ? updatedReview : r))
    );
  };
  const onReviewDeleted = (reviewId) => {
    setReviews(reviews.filter((r) => r._id !== reviewId));
  };

  if (loading) {
    return <MovieDetailsSkeleton />;
  }

  if (!movie)
    return (
      <div className="container mx-auto p-8 text-center text-red-500">
        {t("चलचित्र फेला परेन।", "Movie not found.")}{" "}
      </div>
    );

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"
      }`}
    >
      {/* banner */}
      <div className="relative h-64 md:h-[55vh] w-full">
        <div className="absolute inset-0 bg-black overflow-hidden">
          <img
            src={getImageUrl(movie.bannerImage || movie.posterImage)}
            alt={`${movie.title} banner`}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>{" "}
        </div>
        <div className="relative container mx-auto p-4 md:p-8 h-full flex flex-col justify-end">
          <div className="max-w-3xl text-white">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-gray-200 text-sm">
              <span className="font-bold border px-2 py-0.5 rounded-md text-sm">
                {movie.certification}
              </span>
              <span>{movie.genre.join(", ")}</span>
              <span>•</span>
              <span>
                {t(`${movie.duration} मिनेट`, `${movie.duration} mins`)}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg">
              {t(movie.titleNepali, movie.title)}
            </h1>
          </div>
        </div>
      </div>
      {/* main */}
      <div className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* left: poster and booking button */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-24 space-y-4">
              <img
                src={getImageUrl(movie.posterImage)}
                alt={`${movie.title} poster`}
                className="rounded-xl shadow-2xl w-full max-w-sm lg:max-w-full mx-auto"
              />
              <div className="space-y-3">
                <Link
                  to={`/booking/${movie._id}`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3.5 rounded-full font-bold text-lg hover:bg-purple-700 transition-transform transform hover:scale-105 shadow-lg"
                >
                  <FaTicketAlt /> {t("टिकट बुक गर्नुहोस्", "Book Tickets")}
                </Link>

                {user && (
                  <button
                    onClick={handleWatchlistToggle}
                    disabled={watchlistLoading}
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 shadow-md ${
                      isInWatchlist
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : darkMode
                        ? "bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
                    } ${
                      watchlistLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {watchlistLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    ) : isInWatchlist ? (
                      <FaHeart />
                    ) : (
                      <FaRegHeart />
                    )}
                    {watchlistLoading
                      ? t("अपडेट गर्दै...", "Updating...")
                      : isInWatchlist
                      ? t("वाचलिस्टबाट हटाउनुहोस्", "Remove from Watchlist")
                      : t("वाचलिस्टमा थप्नुहोस्", "Add to Watchlist")}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* right: details and reviews */}
          <div className="lg:col-span-8 xl:col-span-9">
            <section>
              <h2 className="text-3xl font-bold border-b-2 border-purple-500 pb-2 mb-4">
                {t("सिंहावलोकन", "Synopsis")}
              </h2>
              <p
                className={` ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                } leading-relaxed`}
              >
                {t(movie.descriptionNepali, movie.description)}
              </p>
            </section>

            {/* Details Grid */}
            <section className="mt-10">
              <h3 className="text-xl font-bold mb-4">
                {t("विवरण", "Details")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-base">
                <div className="flex flex-col">
                  <strong
                    className={`text-sm  ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {t("निर्देशक", "Director")}:
                  </strong>{" "}
                  <span className="font-medium">{movie.director}</span>
                </div>
                <div className="flex flex-col">
                  <strong
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {t("भाषा", "Language")}:
                  </strong>{" "}
                  <span className="font-medium">{movie.language}</span>
                </div>
                <div className="flex flex-col">
                  <strong
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {t("कलाकार", "Cast")}:
                  </strong>{" "}
                  <span className="font-medium">
                    {formatCastArray(movie.cast)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <strong
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {t("रिलिज मिति", "Release Date")}:
                  </strong>{" "}
                  <span className="font-medium">
                    {/* {formatDate(movie.releaseDate, language)} */}
                    {movie.releaseDate
                      ? new Date(movie.releaseDate).toLocaleDateString(
                          language === "np" ? "ne-Np" : "en-US",
                          { year: "numeric", month: "long", day: "numeric" }
                        )
                      : t("उपलब्ध छैन", "N/A")}
                  </span>
                </div>
              </div>
            </section>

            {movie.trailerUrl && (
              <a
                href={movie.trailerUrl}
                target="_blank"
                className="mt-8 inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition shadow-md"
              >
                <FaPlay /> {t("ट्रेलर हेर्नुहोस्", "Watch Trailer")}
              </a>
            )}

            <ReviewSection
              movieId={movieId}
              reviews={reviews}
              currentUser={user}
              onReviewAdded={onReviewAdded}
              onReviewUpdated={onReviewUpdated}
              onReviewDeleted={onReviewDeleted}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
