import React, { useState, useEffect } from "react";
import { FaCrown, FaLock, FaSpinner } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatTime } from "../../services/utils";

const Seat = ({ seatId, seatInfo, isSelected, onSelect, darkMode, t, animationDelay = 0 }) => {
  const getSeatClass = () => {
    if (
      seatInfo.status === "booked" ||
      (seatInfo.status === "locked" && !seatInfo.lockedByCurrentUser)
    ) {
      return darkMode
        ? "bg-red-900 border border-red-600 cursor-not-allowed opacity-90"
        : "bg-gray-400 cursor-not-allowed opacity-70";
    }

    if (seatInfo.status === "locked" && seatInfo.lockedByCurrentUser) {
      return darkMode
        ? "bg-orange-600 border border-orange-400 cursor-pointer hover:bg-orange-500 shadow-sm"
        : "bg-orange-400 border border-orange-600 cursor-pointer hover:bg-orange-300 shadow-sm";
    }
    
    if (isSelected) {
      return "bg-purple-600 text-white ring-1 ring-purple-300 dark:ring-purple-500 transform scale-110 shadow-md";
    }

    if (seatInfo.type === "premium") {
      return darkMode
        ? "bg-gradient-to-br from-amber-500 to-yellow-600 text-gray-900 hover:from-amber-400 hover:to-yellow-500 border border-amber-400"
        : "bg-gradient-to-br from-yellow-300 to-amber-400 text-gray-900 hover:from-yellow-200 hover:to-amber-300 border border-yellow-500";
    }
    
    return darkMode
      ? "bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-400";
  };

  const getSeatIcon = () => {
    if (seatInfo.type === "premium" && !isSelected) {
      return (
        <FaCrown className="absolute -top-0.5 -right-0.5 text-[6px] xs:text-[7px] text-yellow-600 animate-bounce-gentle" />
      );
    }
    if (seatInfo.status === "locked" && seatInfo.lockedByCurrentUser) {
      return (
        <FaLock className="absolute -top-0.5 -right-0.5 text-[6px] xs:text-[7px] text-orange-800" />
      );
    }
    return null;
  };

  const handleClick = () => {
    if (
      seatInfo.status === "available" ||
      (seatInfo.status === "locked" && seatInfo.lockedByCurrentUser)
    ) {
      onSelect(seatId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={
        seatInfo.status === "booked" ||
        (seatInfo.status === "locked" && !seatInfo.lockedByCurrentUser)
      }
      className={`relative w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded text-[8px] xs:text-[9px] sm:text-[10px] font-bold transition-all duration-300 ease-out focus:outline-none focus:ring-1 focus:ring-offset-1 ${
        darkMode ? "focus:ring-offset-gray-900" : "focus:ring-offset-gray-50"
      } focus:ring-purple-500 ${getSeatClass()} animate-fade-in`}
      style={{ animationDelay: `${animationDelay}ms` }}
      aria-label={`${t("सिट", "Seat")} ${seatId} - ${
        seatInfo.type || "standard"
      } (${seatInfo.status})`}
    >
      {seatId.replace(/^[A-Z]/, "")}
      {getSeatIcon()}
    </button>
  );
};

function Step2_SeatSelection({
  seatMapData,
  selectedSeats,
  onSeatSelect,
  maxSeatsToSelect,
  onNextStep,
  onPrevStep,
  isLoadingSeatMap,
  isProcessingLock,
  selectedShowtime,
  movie,
}) {
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const [animateSeats, setAnimateSeats] = useState(false);

  const locale = language === "np" ? "ne-NP" : "en-US";

  useEffect(() => {
    if (seatMapData && !isLoadingSeatMap) {
      setTimeout(() => setAnimateSeats(true), 100);
    }
  }, [seatMapData, isLoadingSeatMap]);

  if (isLoadingSeatMap) {
    return (
      <div
        className={`p-3 sm:p-4 rounded-lg shadow-md animate-fade-in ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        } flex flex-col items-center min-h-[300px] justify-center`}
      >
        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-purple-500 mb-3"></div>
        <p className={`text-sm ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
          {t("सिट नक्सा लोड हुँदैछ...", "Loading seat map...")}
        </p>
      </div>
    );
  }

  if (!seatMapData || !seatMapData.seats || !seatMapData.layout) {
    return (
      <div
        className={`p-3 sm:p-4 rounded-lg shadow-md animate-fade-in ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        } flex flex-col items-center`}
      >
        <p className="text-center py-6 text-sm">
          {t(
            "यो शो-समयको लागि सिट नक्सा उपलब्ध छैन।",
            "Seat map not available for this showtime."
          )}
        </p>
      </div>
    );
  }

  const { seats: seatStatusMap, layout } = seatMapData;
  const { rows = [], seatsPerRow = 0 } = layout;

  return (
    <div className={`container mx-auto p-2 sm:p-4 transition-colors duration-300 ${
      darkMode ? "text-white bg-gray-900" : "text-gray-900 bg-gray-50"
    }`}>
      {/* Header - More Compact */}
      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-center animate-slide-in-from-top ${
        darkMode ? "text-white" : "text-gray-900"
      }`}>
        {t("आफ्नो सिट चयन गर्नुहोस्", "Select Your Seats")}
      </h2>

      {movie && selectedShowtime && (
        <p className={`text-xs sm:text-sm text-center mb-4 animate-fade-in stagger-1 ${
          darkMode ? "text-gray-400" : "text-gray-500"
        }`}>
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            {t(movie.titleNepali, movie.title)}
          </span>{" "}
          {t("मा", "at")} {formatTime(selectedShowtime.startTime, locale)}
        </p>
      )}

      {/* Main Seat Container - More Compact */}
      <div
        className={`p-3 sm:p-4 lg:p-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow-lg flex flex-col items-center animate-scale-in transition-colors duration-300`}
      >
        {/* Screen - Smaller */}
        <div
          className={`w-full max-w-xs sm:max-w-sm h-1.5 ${
            darkMode ? "bg-gray-500" : "bg-gray-300"
          } mb-1 screen-shadow rounded-t-full transition-colors duration-300`}
        ></div>
        <div
          className={`w-3/4 max-w-xs h-1 ${
            darkMode ? "bg-gray-600" : "bg-gray-400"
          } mb-3 screen-shadow rounded-t-full transition-colors duration-300`}
        ></div>
        <p
          className={`text-[10px] sm:text-xs font-semibold ${
            darkMode ? "text-gray-300" : "text-gray-500"
          } mb-4 sm:mb-6 tracking-widest uppercase animate-fade-in stagger-2`}
        >
          {t("स्क्रिन यता छ", "Screen This Way")}
        </p>

        {/* Seat Grid - More Compact */}
        <div className="w-full space-y-1 sm:space-y-2 flex flex-col items-center overflow-x-auto pb-3">
          {rows.map((rowLabel, rowIndex) => (
            <div
              key={rowLabel}
              className="flex items-center justify-center gap-0.5 sm:gap-1 animate-slide-in-from-bottom"
              style={{ animationDelay: `${(rowIndex + 3) * 50}ms` }}
            >
              {/* Row Label - Smaller */}
              <div className={`w-4 sm:w-5 font-bold text-[10px] sm:text-xs text-center transition-colors duration-300 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                {rowLabel}
              </div>
              
              {/* Seats */}
              <div className="flex gap-0.5 sm:gap-1 flex-nowrap">
                {Array.from({ length: seatsPerRow }, (_, i) => {
                  const seatNumber = i + 1;
                  const seatId = `${rowLabel}${seatNumber}`;

                  const seatInfo = seatStatusMap.find(
                    (seat) => seat.seatName === seatId
                  ) || {
                    seatName: seatId,
                    status: "available",
                    type: "standard",
                    lockedByCurrentUser: false,
                  };
                  return (
                    <Seat
                      key={seatId}
                      seatId={seatId}
                      seatInfo={seatInfo}
                      isSelected={selectedSeats.includes(seatId)}
                      onSelect={onSeatSelect}
                      darkMode={darkMode}
                      t={t}
                      animationDelay={animateSeats ? (rowIndex * 30 + i * 10) : 0}
                    />
                  );
                })}
              </div>
              
              {/* Row Label - Right */}
              <div className={`w-4 sm:w-5 font-bold text-[10px] sm:text-xs text-center transition-colors duration-300 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
                {rowLabel}
              </div>
            </div>
          ))}
        </div>

        {/* Legend - More Compact */}
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 sm:gap-x-4 sm:gap-y-2 mt-4 sm:mt-6 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1 animate-fade-in stagger-3">
            <div
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-700 border border-gray-600"
                  : "bg-gray-200 border border-gray-400"
              }`}
            ></div>
            <span className={darkMode ? "text-gray-200" : "text-gray-700"}>
              {t("उपलब्ध", "Available")}
            </span>
          </div>
          
          <div className="flex items-center gap-1 animate-fade-in stagger-4">
            <div className="relative w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-gradient-to-br from-yellow-300 to-amber-400 border border-yellow-500">
              <FaCrown className="absolute -top-0.5 -right-0.5 text-[5px] sm:text-[6px] text-yellow-600 animate-bounce-gentle" />
            </div>
            <span className={darkMode ? "text-gray-200" : "text-gray-700"}>
              {t("प्रिमियम", "Premium")}
            </span>
          </div>
          
          <div className="flex items-center gap-1 animate-fade-in stagger-5">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-purple-600"></div>
            <span className={darkMode ? "text-gray-200" : "text-gray-700"}>
              {t("चयन गरिएको", "Selected")}
            </span>
          </div>
          
          <div className="flex items-center gap-1 animate-fade-in stagger-1">
            <div className="relative w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-orange-400 border border-orange-600">
              <FaLock className="absolute -top-0.5 -right-0.5 text-[5px] sm:text-[6px] text-orange-800" />
            </div>
            <span className={darkMode ? "text-gray-200" : "text-gray-700"}>
              {t("मेरो लक", "My Locked")}
            </span>
          </div>
          
          <div className="flex items-center gap-1 animate-fade-in stagger-2">
            <div
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm transition-colors duration-300 ${
                darkMode ? "bg-red-900 border border-red-600" : "bg-gray-400"
              }`}
            ></div>
            <span className={darkMode ? "text-gray-200" : "text-gray-700"}>
              {t("बुक/लक भएको", "Booked/Locked")}
            </span>
          </div>
        </div>

        {/* Selection Summary - More Compact */}
        <div
          className={`mt-4 sm:mt-6 p-2 sm:p-3 rounded-lg w-full max-w-sm text-xs sm:text-sm transition-colors duration-300 animate-slide-in-from-bottom stagger-3 ${
            darkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          <div className="flex justify-between items-center">
            <span className={darkMode ? "text-gray-200" : "text-gray-700"}>
              {t("चयन गरिएका सिटहरू:", "Selected Seats:")}
            </span>
            <span className={`font-semibold text-right ${
              selectedSeats.length > 0 
                ? "text-purple-600 dark:text-purple-400" 
                : darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              {selectedSeats.length > 0
                ? selectedSeats.sort().join(", ")
                : t("कुनै छैन", "None")}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className={darkMode ? "text-gray-200" : "text-gray-700"}>
              {t("बाँकी सिटहरू:", "Seats Remaining:")}
            </span>
            <span className={`font-semibold ${
              maxSeatsToSelect - selectedSeats.length > 0 
                ? "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
            }`}>
              {maxSeatsToSelect - selectedSeats.length}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons - More Compact */}
      <div className="mt-4 sm:mt-6 flex justify-between gap-3 animate-slide-in-from-bottom stagger-4">
        <button
          onClick={onPrevStep}
          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 flex items-center shadow-md hover:shadow-lg active:scale-95 ${
            darkMode 
              ? "bg-gray-600 hover:bg-gray-700 text-white" 
              : "bg-gray-600 hover:bg-gray-700 text-white"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 transition-transform duration-300 group-hover:-translate-x-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H14.5a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          {t("पछाडि", "Back")}
        </button>

        <button
          onClick={onNextStep}
          disabled={selectedSeats.length === 0 || isProcessingLock}
          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 flex items-center shadow-md hover:shadow-lg active:scale-95 ${
            selectedSeats.length === 0 || isProcessingLock
              ? darkMode
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          {isProcessingLock ? (
            <>
              <FaSpinner className="animate-spin mr-1 sm:mr-2 text-sm" />
              <span className="hidden xs:inline">{t("प्रशोधन हुँदैछ...", "Processing...")}</span>
              <span className="xs:hidden">{t("प्रशोधन...", "Processing...")}</span>
            </>
          ) : (
            <>
              <span className="hidden xs:inline">{t("जारी राख्नुहोस्", "Continue")}</span>
              <span className="xs:hidden">{t("जारी", "Next")}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2 transition-transform duration-300 group-hover:translate-x-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Floating hint - More Compact */}
      {selectedSeats.length === 0 && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-full text-xs shadow-lg animate-bounce-gentle ${
          darkMode ? "bg-gray-800 text-gray-300 border border-gray-700" : "bg-white text-gray-600 border border-gray-200"
        }`}>
          <span className="hidden xs:inline">{t("सिट चयन गर्नुहोस्", "Select seats to continue")}</span>
          <span className="xs:hidden">{t("सिट चयन गर्नुहोस्", "Select seats")}</span>
        </div>
      )}
    </div>
  );
}

export default Step2_SeatSelection;