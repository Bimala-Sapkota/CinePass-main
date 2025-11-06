import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { FiAlertTriangle } from "react-icons/fi";

const CancellationModal = ({ booking, onClose, onConfirm, isLoading }) => {
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  if (!booking) return null;

  const refundMessage =
    booking.paymentMethod === "khalti"
      ? t(
          "तपाईंको भुक्तानी स्वतः फिर्ता हुनेछ।",
          "Your payment will be refunded automatically."
        )
      : t(
          "म्यानुअल प्रशोधनको लागि हाम्रो टोलीलाई फिर्ता अनुरोध पठाइनेछ।",
          "A refund request will be sent to our team for manual processing."
        );

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[1000] animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
        } animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start">
          <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 mr-4">
            <FiAlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">
              {t("रद्द गर्ने पुष्टि गर्नुहोस्", "Confirm Cancellation")}
            </h3>
            <p
              className={`mb-4 text-sm ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {t(
                "के तपाईं साँच्चै आफ्नो बुकिंग रद्द गर्न चाहनुहुन्छ",
                "Are you sure you want to cancel your booking for"
              )}{" "}
              <strong>{booking.showtime.movie.title}</strong>?{" "}
              {t(
                "यो कार्यलाई उल्टाउन सकिँदैन।",
                "This action cannot be undone."
              )}
            </p>
          </div>
        </div>
        <div
          className={`p-3 rounded-lg text-xs mt-2 mb-6 ${
            darkMode
              ? "bg-yellow-900/30 text-yellow-300"
              : "bg-yellow-50 text-yellow-800"
          }`}
        >
          {refundMessage}
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {t("पछाडि जानुहोस्", "Go Back")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-semibold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors disabled:bg-red-400"
          >
            {isLoading
              ? t("प्रशोधन हुँदैछ...", "Processing...")
              : t("हो, बुकिंग रद्द गर्नुहोस्", "Yes, Cancel Booking")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;
