import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

function AppLoader({ onLoadingComplete }) {
  const { darkMode } = useTheme();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onLoadingComplete, 100);
          }, 100);
          return 100;
        }
        return prev + Math.random() * 12 + 5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  if (!isVisible) return null;
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${
        progress >= 100 ? "opacity-0" : "opacity-100"
      } ${darkMode ? "bg-gray-900" : "bg-white"}`}
    >
      <div className="text-center">
        {/* Logo animation */}
        <div className="mb-8 animate-pulse">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-white font-extrabold text-3xl">C</span>
          </div>
          <h1
            className={`mt-4 text-2xl font-bold bg-gradient-to-r ${
              darkMode
                ? "from-purple-400 to-pink-400"
                : "from-purple-600 to-pink-600"
            } bg-clip-text text-transparent`}
          >
            CinePass
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div
            className={`h-1 rounded-full overflow-hidden ${
              darkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p
            className={`mt-3 text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Loading your cinema experience...
          </p>
        </div>
      </div>
    </div>
  );
}

export default AppLoader;
