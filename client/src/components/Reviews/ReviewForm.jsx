import React, { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import StarRating from "../common/StarRating";
import api from "../../services/api";
import { useTheme } from "../../context/ThemeContext";

function ReviewForm({
  movieId,
  existingReview,
  onReviewAdded,
  onReviewUpdated,
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const { t } = useLanguage();
  const { darkMode } = useTheme();

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    } else {
      setRating(0);
      setComment("");
    }
  }, [existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
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

    const reviewData = { rating, comment };

    try {
      if (existingReview) {
        const { data } = await api.put(
          `movies/${movieId}/reviews/${existingReview._id}`,
          reviewData
        );
        onReviewUpdated(data.data);
        showToast(
          t(
            "समीक्षा सफलतापूर्वक अद्यावधिक गरियो!",
            "Review updated successfully!"
          ),
          "success"
        );
      } else {
        const { data } = await api.post(
          `/movies/${movieId}/reviews`,
          reviewData
        );
        onReviewAdded(data.data);
        showToast(
          t("समीक्षा सफलतापूर्वक पेश गरियो!", "Review submitted successfully!"),
          "success"
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.error || t("अनुरोध असफल भयो।", "Request failed.");
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formTitle = existingReview
    ? t("आफ्नो समीक्षा सम्पादन गर्नुहोस्", "Edit Your Review")
    : t("आफ्नो समीक्षा लेख्नुहोस्", "Write Your Review");
  return (
    <form
      onSubmit={handleSubmit}
      className={`mb-8 p-6 ${
        darkMode ? "bg-gray-800" : "bg-gray-100"
      } rounded-xl shadow-inner`}
    >
      <h3 className="font-bold text-lg mb-3">{formTitle}</h3>
      <div className="mb-4">
        <StarRating
          rating={rating}
          onRatingChange={setRating}
          isInput={true}
          size={28}
        />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t(
          "आफ्नो विचार साझा गर्नुहोस्...",
          "Share your thoughts..."
        )}
        className={`w-full p-3 rounded-lg border  ${
          darkMode ? "bg-gray-700 border-gray-600" : "bg-white"
        } d focus:ring-2 focus:ring-purple-500 focus:outline-none transition"`}
        rows="4"
      ></textarea>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting
          ? t("पेश गर्दै...", "Submitting...")
          : t("पेश गर्नुहोस्", "Submit")}
      </button>
    </form>
  );
}

export default ReviewForm;
