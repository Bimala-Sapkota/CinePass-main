import { useTheme } from "../../context/ThemeContext";

function MovieCardSkeleton() {
  const { darkMode } = useTheme(); // To match theme
  return (
    <div
      className={`rounded-xl overflow-hidden shadow-lg animate-pulse ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div
        className={`md:w-1/3 w-full h-48 md:h-auto ${
          darkMode ? "bg-gray-700" : "bg-gray-300"
        }`}
      ></div>{" "}
      {/* Image placeholder */}
      <div className="md:w-2/3 w-full p-4">
        <div
          className={`h-5 w-3/4 mb-2 rounded ${
            darkMode ? "bg-gray-700" : "bg-gray-300"
          }`}
        ></div>{" "}
        {/* Title placeholder */}
        <div
          className={`h-4 w-1/2 mb-1 rounded ${
            darkMode ? "bg-gray-700" : "bg-gray-300"
          }`}
        ></div>{" "}
        {/* Genre placeholder */}
        <div
          className={`h-4 w-1/4 mb-3 rounded ${
            darkMode ? "bg-gray-700" : "bg-gray-300"
          }`}
        ></div>{" "}
        {/* Rating/Duration placeholder */}
        <div
          className={`h-9 w-2/5 rounded-full ${
            darkMode ? "bg-purple-700" : "bg-purple-300"
          }`}
        ></div>{" "}
        {/* Button placeholder */}
      </div>
    </div>
  );
}
export default MovieCardSkeleton;
