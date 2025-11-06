import React from "react";
import { useNavigate } from "react-router";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { FaTimesCircle, FaHome, FaRedo } from "react-icons/fa";

function PaymentFailurePage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div
        className={`max-w-md w-full p-8 rounded-xl shadow-xl text-center ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <FaTimesCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-2xl font-bold mb-2">
          {t("भुक्तानी रद्द गरियो", "Payment Cancelled")}
        </h2>
        <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          {t(
            "तपाईंको भुक्तानी रद्द गरिएको छ वा असफल भएको छ।",
            "Your payment has been cancelled or failed."
          )}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center"
          >
            <FaHome className="mr-2" />
            {t("गृह पृष्ठमा जानुहोस्", "Go to Home")}
          </button>

          <button
            onClick={() => window.history.back()}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            <FaRedo className="mr-2" />
            {t("फेरि प्रयास गर्नुहोस्", "Try Again")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailurePage;
