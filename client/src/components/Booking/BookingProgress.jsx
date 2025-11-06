import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { FaCalendarAlt, FaCouch, FaCreditCard } from "react-icons/fa";

function BookingProgress({ currentStep, totalSteps = 3 }) {
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  const steps = [
    { icon: <FaCalendarAlt />, label: t("मिति र समय", "Date & Time") },
    { icon: <FaCouch />, label: t("सिटहरू", "Seats") },
    { icon: <FaCreditCard />, label: t("भुक्तानी", "Payment") },
  ];
  return (
    <div className="mb-8 md:mb-12 animate-fade-in">
      <div className="relative max-w-2xl mx-auto px-4">
        {/* progress line */}
        <div
          className={`absolute top-5 left-0 right-0 rounded-full h-1 ${
            darkMode ? "bg-gray-700" : "bg-gray-300"
          } z-0`}
          style={{ marginLeft: "10%", marginRight: "10%" }}
        ></div>
        <div
          className={`absolute top-5 left-0 h-1 rounded-full z-10 transition-all duration-700 ease-out ${
            darkMode ? "bg-purple-400" : "bg-purple-600"
          }`}
          style={{
            marginLeft: "10%",
            width: `${((currentStep - 1) / (totalSteps - 1)) * 80}%`,
          }}
        ></div>

        {/* steps */}
        <div className="relative flex items-center justify-between z-20">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center transition-all duration-500 ${
                currentStep >= index + 1
                  ? darkMode
                    ? "text-purple-400"
                    : "text-purple-600"
                  : darkMode
                  ? "text-gray-500"
                  : "text-gray-400"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 text-lg md:text-xl transition-all duration-500 border-2 transform ${
                  currentStep >= index + 1
                    ? `text-white scale-110 shadow-lg ${
                        darkMode
                          ? "bg-purple-500 border-purple-400 shadow-purple-400/30"
                          : "bg-purple-600 border-purple-600 shadow-purple-600/30"
                      }`
                    : darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-500"
                    : "bg-gray-200 border-gray-300 text-gray-400"
                } ${currentStep === index + 1 ? "animate-pulse" : ""}`}
              >
                {currentStep > index + 1 ? (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium text-center">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BookingProgress;
