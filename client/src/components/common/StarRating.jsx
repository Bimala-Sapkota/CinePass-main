import React, { useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";

function StarRating({
  count = 5,
  rating,
  onRatingChange,
  size = 24,
  color = "#ffc107",
  isInput = false,
}) {
  const [hover, setHover] = useState(null);
  const handleClick = (ratingValue) => {
    if (isInput && onRatingChange) {
      onRatingChange(ratingValue);
    }
  };
  return (
    <div className="flex items-center">
      {[...Array(count)].map((_, index) => {
        const ratingValue = index + 1;
        const startIcon =
          ratingValue <= (hover || rating) ? <FaStar /> : <FaRegStar />;

        return (
          <label key={index}>
            {isInput && (
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                onClick={() => handleClick(ratingValue)}
                className="hidden"
              />
            )}

            <span
              style={{ color, fontSize: size }}
              className={isInput ? "cursor-pointer" : ""}
              onMouseEnter={isInput ? () => setHover(ratingValue) : null}
              onMouseLeave={isInput ? () => setHover(null) : null}
            >
              {startIcon}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default StarRating;
