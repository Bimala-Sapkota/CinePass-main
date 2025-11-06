import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import ReviewForm from "./ReviewForm";
import ReviewItem from "./ReviewItem";
import { useTheme } from "../../context/ThemeContext";

function ReviewSection({
  movieId,
  reviews,
  currentUser,
  onReviewAdded,
  onReviewUpdated,
  onReviewDeleted,
}) {
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  const userReview = reviews.find((r) => r.user?._id === currentUser?._id);
  return (
    <section className="mt-12 border-t pt-8 dark:border-gray-700">
      <h2 className="text-3xl font-bold mb-6">
        {t("मूल्याङ्कन र समीक्षाहरू", "Ratings & Reviews")}
      </h2>
      {currentUser ? (
        <ReviewForm
          movieId={movieId}
          existingReview={userReview}
          onReviewAdded={onReviewAdded}
          onReviewUpdated={onReviewUpdated}
        />
      ) : (
        <div
          className={`mb-8 p-4 text-center  ${
            darkMode ? "bg-gray-800" : "bg-gray-100"
          } rounded-lg`}
        >
          <p>
            {t(
              "समीक्षा लेख्नको लागि कृपया लगइन गर्नुहोस्।",
              "Please log in to write a review."
            )}
          </p>
        </div>
      )}

      <div className="space-y-6 mt-8">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewItem
              key={review._id}
              review={review}
              currentUser={currentUser}
              onReviewUpdated={onReviewUpdated}
              onReviewDeleted={onReviewDeleted}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">
            {t(
              "यस चलचित्रको लागि पहिलो समीक्षा गर्नुहोस्!",
              "Be the first to review this movie!"
            )}
          </p>
        )}
      </div>
    </section>
  );
}

export default ReviewSection;
