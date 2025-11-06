import React from "react";
import { useTheme } from "../../context/ThemeContext";

const TrailerCardSkeleton = () => {
  const { darkMode } = useTheme();

  return (
    <div
      className={`rounded-lg overflow-hidden ${
        darkMode ? "bg-gray-800" : "bg-white"
      } shadow-lg`}
    >
      <div
        className={`relative aspect-video ${
          darkMode ? "bg-gray-700" : "bg-gray-300"
        } overflow-hidden`}
      >
        <div className="absolute inset-0 loading-shimmer"></div>
      </div>
      <div className="p-4">
        <div
          className={`h-5 w-3/4 rounded ${
            darkMode ? "bg-gray-700" : "bg-gray-300"
          }`}
        ></div>
        <div
          className={`h-4 w-1/2 rounded mt-2 ${
            darkMode ? "bg-gray-700" : "bg-gray-300"
          }`}
        ></div>
      </div>
    </div>
  );
};

export default TrailerCardSkeleton;
