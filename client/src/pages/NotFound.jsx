import React from "react";
import { useNavigate } from "react-router";
import { FaHome, FaArrowLeft } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

const FloatingShape = ({ style, animationDuration }) => (
  <div
    className={`absolute rounded-full filter blur-2xl`}
    style={{
      ...style,
      animation: `float-orbit ${animationDuration} ease-in-out infinite`,
    }}
  ></div>
);

function NotFound() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  const numberClasses = `text-8xl sm:text-9xl font-black transition-transform duration-500 ease-out`;
  return (
    <div
      className={`relative flex items-center justify-center min-h-screen p-4 overflow-hidden page-transition ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-slate-100 text-gray-900"
      }`}
    >
      <FloatingShape
        style={{
          width: "16rem",
          height: "16rem",
          top: "-5rem",
          left: "-5rem",
          background: darkMode
            ? "rgba(129, 140, 248, 0.15)"
            : "rgba(199, 210, 254, 0.6)",
        }}
        animationDuration="15s"
      />
      <FloatingShape
        style={{
          width: "18rem",
          height: "18rem",
          bottom: "-5rem",
          right: "-5rem",
          background: darkMode
            ? "rgba(244, 114, 182, 0.15)"
            : "rgba(251, 207, 232, 0.6)",
        }}
        animationDuration="12s"
      />

      {darkMode && (
        <div className="absolute inset-0 w-full h-full bg-black/10"></div>
      )}

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="group perspective-1000 mb-6">
          <div className="flex items-center justify-center gap-x-0.5 transition-transform duration-500 ease-out preserve-3d group-hover:rotate-x-[-10deg] group-hover:rotate-y-[8deg] group-hover:scale-105">
            <h1
              className={`${numberClasses} ${
                darkMode ? "text-gray-350" : "text-gray-650"
              } group-hover:translate-x-[-4%]`}
            >
              4
            </h1>
            <h1
              className={`${numberClasses} bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 z-10 group-hover:scale-110`}
            >
              0
            </h1>
            <h1
              className={`${numberClasses} ${
                darkMode ? "text-gray-350" : "text-gray-650"
              } group-hover:translate-x-[4%]`}
            >
              4
            </h1>
          </div>
        </div>
        <h2
          className="text-3xl sm:text-4xl font-bold animate-slide-in-from-bottom"
          style={{ animationDelay: "200ms" }}
        >
          {t("पृष्ठ भेटिएन", "Page Not Found")}
        </h2>

        <p
          className={`text-lg mt-2 max-w-md mx-auto ${
            darkMode ? "text-gray-400" : "text-gray-600"
          } animate-slide-in-from-bottom"`}
          style={{ animationDelay: "300ms" }}
        >
          {t(
            "माफ गर्नुहोस्, तपाईंले खोज्नु भएको पृष्ठ उपलब्ध छैन वा सारिएको छ।",
            "Sorry, the page you're looking for isn't available or has been moved."
          )}
        </p>

        <div
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in-from-bottom"
          style={{ animationDelay: "400ms" }}
        >
          <button
            onClick={() => navigate("/")}
            className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
          >
            <FaHome className="transition-transform group-hover:scale-125" />
            <span>{t("गृहपृष्ठ", "Homepage")}</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className={`group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
              darkMode
                ? "bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
                : "bg-white text-gray-600 hover:text-black border-2 border-gray-300 hover:border-gray-400"
            }`}
          >
            <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
            <span>{t("पछाडि जानुहोस्", "Go Back")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
