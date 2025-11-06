import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "react-router";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getImageUrl } from "./../../services/utils";
import { useLanguage } from "../../context/LanguageContext";

function MovieList({ movies, loading, onMovieDeleted, onEditMovie }) {
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  const handleDelete = async (movieId) => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      onMovieDeleted(movieId);
    }
  };
  if (loading)
    return (
      <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
        {t("चलचित्रहरू लोड हुँदैछ...", "Loading movies...")}
      </p>
    );

  if (!movies || movies.length === 0) {
    return (
      <div
        className={`text-center py-8 rounded-lg border-2 border-dashed ${
          darkMode
            ? "text-gray-400 border-gray-600 bg-gray-800"
            : "text-gray-600 border-gray-300 bg-gray-50"
        }`}
      >
        {t(
          "कुनै चलचित्र फेला परेन। माथिको फारम प्रयोग गरी एउटा थप्नुहोस्!",
          "No movies found. Add one using the form above!"
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table
        className={`min-w-full divide-y ${
          darkMode ? "divide-gray-700" : "divide-gray-200"
        }`}
      >
        <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              {t("पोस्टर", "Poster")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              {t("शीर्षक", "Title")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              {t("निर्देशक", "Director")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              {t("स्थिति", "Status")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              {t("कार्यहरू", "Actions")}
            </th>
          </tr>
        </thead>
        <tbody
          className={`divide-y ${
            darkMode
              ? "bg-gray-800 divide-gray-700"
              : "bg-white divide-gray-200"
          }`}
        >
          {movies.map((movie) => (
            <tr key={movie._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <img
                  src={getImageUrl(movie.posterImage)}
                  alt={movie.title}
                  className="h-16 w-12 object-cover rounded"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-medium">
                {movie.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap ">{movie.director}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {movie.isNowShowing && (
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full  ${
                      darkMode
                        ? "text-green-200 bg-gray-900"
                        : "text-green-800 bg-gray-100"
                    }`}
                  >
                    Now Showing
                  </span>
                )}
                {movie.isLatest && (
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      darkMode
                        ? "text-yellow-200 bg-gray-900"
                        : "text-yellow-800 bg-gray-100"
                    }`}
                  >
                    Latest Release
                  </span>
                )}
                {movie.isComingSoon && (
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      darkMode
                        ? "text-blue-200 bg-gray-900"
                        : "text-blue-800 bg-green-100"
                    }`}
                  >
                    Coming Soon
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-4">
                  <Link
                    onClick={() => onEditMovie(movie)}
                    className="text-purple-600 hover:text-purple-900 transition-colors"
                    title="Edit Movie"
                  >
                    <FaEdit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(movie._id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                    title="Delete Movie"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MovieList;
