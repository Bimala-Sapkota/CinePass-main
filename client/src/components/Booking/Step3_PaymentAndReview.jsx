import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { FaClock, FaLock, FaSpinner, FaTicketAlt } from "react-icons/fa";
import { getImageUrl, formatTime } from "./../../services/utils";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";

function Step3_PaymentAndReview({
  movie,
  selectedShowtime,
  selectedSeats,
  orderSummaryDetails,
  onPromoApplied,
  appliedPromo,
  paymentMethods,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onPrevStep,
  onInitiatePaymentAndConfirm,
  isProcessingBooking,
}) {
  const { darkMode } = useTheme();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [promoCode, setPromoCode] = useState("");
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const { subtotal, serviceFee, taxes, finalTotal, currency, numberOfTickets } =
    orderSummaryDetails;

  const locale = language === "np" ? "ne-NP" : "en-US";

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsValidatingPromo(true);
    try {
      const res = await api.post("/offers/validate", {
        promoCode,
        purchaseAmount: orderSummaryDetails.subtotal,
      });
      onPromoApplied(res.data.data);
      showToast(
        t("प्रोमो कोड सफलतापूर्वक लागू भयो!", "Promo code applied!"),
        "success"
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || t("अमान्य कोड", "Invalid code");
      showToast(errorMessage, "error");
      onPromoApplied(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-slide-up-fade">
      <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
        {t("समीक्षा र भुक्तानी", "Review & Pay")}{" "}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <div
            className={`p-4 sm:p-6 rounded-xl shadow-xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3
              className={`text-xl font-semibold mb-4 border-b pb-3 ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              {t("भुक्तानी विधि छान्नुहोस्", "Choose Payment Method")}{" "}
            </h3>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => onPaymentMethodSelect(method.id)}
                  className={`p-4 rounded-lg border-2 flex items-center cursor-pointer transition-all duration-200 transform hover:scale-[1.02]
                     ${
                       selectedPaymentMethod === method.id
                         ? darkMode
                           ? "border-purple-500 bg-purple-900/30 ring-2 ring-purple-500"
                           : "border-purple-600 bg-purple-50 ring-2 ring-purple-600"
                         : darkMode
                         ? "border-gray-700 hover:border-purple-600 bg-gray-700/50"
                         : "border-gray-200 hover:border-purple-400 bg-white"
                     }`}
                >
                  <div className="mr-4">
                    {method.logoUrl ? (
                      <img
                        src={method.logoUrl}
                        alt={method.name}
                        className="w-10 h-auto mr-4"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                          darkMode ? "bg-gray-600" : "bg-gray-100"
                        }`}
                      >
                        <i
                          className={`fas ${method.icon} text-xl ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        ></i>
                      </div>
                    )}
                  </div>

                  <span className="font-medium text-base">
                    {t(method.name, method.name)}
                  </span>
                  {selectedPaymentMethod === method.id && (
                    <FaTicketAlt
                      className="ml-auto text-purple-600 dark:text-purple-400"
                      size={20}
                    />
                  )}
                </div>
              ))}
            </div>

            <div
              className={`mt-6 p-3 rounded-lg flex items-start text-xs ${
                darkMode
                  ? "bg-gray-700 text-gray-300"
                  : "bg-green-50 text-green-700"
              }`}
            >
              <FaLock
                className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
                size={16}
              />
              <p>
                {t(
                  "तपाईंको भुक्तानी जानकारी सुरक्षित छ। हामी उद्योग-मानक इन्क्रिप्सन प्रयोग गर्छौं।",
                  "Your payment information is secure. We use industry-standard encryption."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* right side: order summary */}
        <div className="lg:col-span-1">
          <div
            className={`p-4 sm:p-6 rounded-xl shadow-xl sticky top-24 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3
              className={`text-xl font-semibold mb-4 border-b pb-3 ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              {t("बुकिङ सारांश", "Booking Summary")}
            </h3>

            {movie && selectedShowtime && (
              <div
                className={`p-3 rounded-lg mb-4 ${
                  darkMode ? "bg-gray-700/50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-start mb-2">
                  <div className="w-16 h-24 rounded overflow-hidden mr-3 flex-shrink-0 shadow-md">
                    <img
                      src={getImageUrl(movie.posterImage)}
                      alt={t(movie.titleNepali, movie.title)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm line-clamp-2">
                      {t(movie.titleNepali, movie.title)}
                    </h4>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {new Date(selectedShowtime.startTime).toLocaleDateString(
                        locale,
                        { weekday: "short", month: "short", day: "numeric" }
                      )}
                      , {formatTime(selectedShowtime.startTime)}
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {t(
                        selectedShowtime.theater?.nameNepali,
                        selectedShowtime.theater?.name
                      )}{" "}
                    </p>
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>
                      {t("सिटहरू", "Seats")} ({numberOfTickets}):
                    </span>
                    <span className="font-medium text-right break-all">
                      {selectedSeats.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-sm mb-4">
              <div className="flex justify-between">
                <span>{t("उप-कुल", "Subtotal")}:</span>
                <span>
                  {currency} {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("सेवा शुल्क", "Service Fee")}:</span>
                <span>
                  {currency} {serviceFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("करहरू", "Taxes")}:</span>
                <span>
                  {currency} {taxes.toFixed(2)}
                </span>
              </div>
            </div>

            {/* promo code */}
            <div
              className={`mt-4 pt-4 border-t ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <label htmlFor="promo-code" className="text-sm font-medium">
                {t("प्रोमो कोड", "Promo Code")}
              </label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={!!appliedPromo}
                  className={`w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-300"
                  } ${!!appliedPromo ? "cursor-not-allowed opacity-60" : ""}`}
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={isValidatingPromo || !!appliedPromo}
                  className={`px-4 py-2 text-sm font-semibold text-white rounded-md transition-all ${
                    isValidatingPromo || !!appliedPromo || !promoCode
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {isValidatingPromo ? (
                    <FaSpinner className="animate-spin" />
                  ) : appliedPromo ? (
                    t("लागू भयो", "Applied")
                  ) : (
                    t("लागू गर्नुहोस्", "Apply")
                  )}
                </button>
              </div>
              {appliedPromo && (
                <button
                  onClick={() => {
                    onPromoApplied(null);
                    setPromoCode("");
                  }}
                  className="text-xs text-red-500 hover:underline mt-1"
                >
                  {t("हटाउनुहोस्", "Remove")}
                </button>
              )}
            </div>

            {appliedPromo && (
              <div className="flex justify-between text-sm mt-2 text-green-500">
                <span>
                  {t("छूट", "Discount")} ({appliedPromo.promoCode}):
                </span>
                <span>- NRs. {orderSummaryDetails.discount.toFixed(2)}</span>
              </div>
            )}

            <div
              className={`flex justify-between font-bold text-lg pt-3 border-t ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <span>{t("कुल रकम", "Total Amount")}:</span>
              <span className="text-purple-600 dark:text-purple-400">
                NRs. {orderSummaryDetails.finalTotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={onInitiatePaymentAndConfirm}
              disabled={!selectedPaymentMethod || isProcessingBooking}
              className={`w-full mt-6 py-3 rounded-full font-semibold text-base transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95
                 ${
                   !selectedPaymentMethod
                     ? darkMode
                       ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                       : "bg-gray-300 text-gray-500 cursor-not-allowed"
                     : darkMode
                     ? "bg-purple-600 hover:bg-purple-700 text-white"
                     : "bg-purple-600 hover:bg-purple-700 text-white"
                 }`}
            >
              {isProcessingBooking ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaLock className="mr-2" />
              )}
              {isProcessingBooking
                ? t("प्रशोधन हुँदैछ...", "Processing...")
                : `${t(
                    "भुक्तानी गर्नुहोस्",
                    "Pay"
                  )} ${currency} ${finalTotal.toFixed(2)}`}
            </button>
            <p className="text-xs text-center mt-3 text-gray-500 dark:text-gray-400">
              {t(
                "खरिद पूरा गरेर, तपाईं हाम्रो सेवाका सर्तहरूमा सहमत हुनुहुन्छ।",
                "By completing your purchase, you agree to our Terms of Service."
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-start">
        <button
          onClick={onPrevStep}
          disabled={isProcessingBooking}
          className={`px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 flex items-center shadow-md hover:shadow-lg active:scale-95
                        ${
                          darkMode
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                        }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          {t("पछाडि", "Back")}
        </button>
      </div>
    </div>
  );
}

export default Step3_PaymentAndReview;
