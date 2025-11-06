import React from "react";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import { FaTrash } from "react-icons/fa";
import StarRating from "../common/StarRating";
import { getImageUrl } from "../../services/utils";
import { useLanguage } from "../../context/LanguageContext";

function ReviewItem({ review, currentUser, onReviewDeleted }) {
  const { showToast } = useToast();
  const { t } = useLanguage();

  if (!review?.user) return null;

  const isOwnReview = currentUser && currentUser._id === review.user?._id;

  const handleDelete = async () => {
    if (
      window.confirm(
        t(
          "के तपाईं यो समीक्षा मेटाउन निश्चित हुनुहुन्छ?",
          "Are you sure you want to delete this review?"
        )
      )
    ) {
      try {
        await api.delete(`/movies/${review.movie}/reviews/${review._id}`);
        onReviewDeleted(review._id);
        showToast(t("समीक्षा मेटाइयो।", "Review deleted."), "success");
      } catch (error) {
        showToast(
          t("समीक्षा मेटाउन सकिएन।", "Failed to delete review."),
          "error"
        );
      }
    }
  };
  return (
    <div className="flex gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
      <img
        src={getImageUrl(review.user.avatar)}
        alt={review.user.username}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-800 dark:text-white">
              {review.user.username}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
          {isOwnReview && (
            <div className="flex items-center gap-3">
              {/* Edit button could trigger a modal or an inline form in a more complex setup */}
              {/* <button className="text-gray-500 hover:text-blue-500"><FaEdit /></button> */}
              <button
                onClick={handleDelete}
                className="text-gray-500 hover:text-red-500"
                aria-label="Delete review"
              >
                <FaTrash />
              </button>
            </div>
          )}
        </div>
        <div className="my-2">
          <StarRating rating={review.rating} size={18} />
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {review.comment}
        </p>
      </div>
    </div>
  );
}

export default ReviewItem;
