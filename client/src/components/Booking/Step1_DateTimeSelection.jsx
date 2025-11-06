import React, { useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";
import { formatMonthDay, formatTime } from "../../services/utils";

function Step1_DateTimeSelection({
  dates,
  selectedDate,
  onDateSelect,
  theatersAndShowtimes,
  selectedShowtime,
  onShowtimeSelect,
  onNextStep,
  isLoadingShowtimes,
  movieTitle,
}) {
  const { darkMode } = useTheme();
  const { t, language } = useLanguage();

  useEffect(() => window.scrollTo(0, 0), []);

  const locale = language === "np" ? "ne-NP" : "en-US";

  return (
    <div className="max-w-4xl mx-auto animate-slide-up-fade">
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
        <span className={`${darkMode ? "text-purple-400" : "text-purple-600"}`}>
          {t(
            `${movieTitle} का लागि मिति चयन गर्नुहोस्`,
            `Select Date for ${movieTitle}`
          )}
        </span>{" "}
      </h2>

      <div className="mb-8 ">
        <div className="flex  flex-wrap gap-3 justify-center md:justify-start">
          {dates &&
            dates.map((date) => {
              return (
                <button
                  key={date.fullDate}
                  onClick={() => {
                    onDateSelect(date.fullDate);
                  }}
                  className={`flex flex-col items-center p-3 rounded-lg min-w-[80px] sm:min-w-[90px] cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg ${
                    selectedDate === date.fullDate
                      ? "bg-purple-600 text-white scale-105 ring-2 ring-purple-300 dark:ring-purple-500"
                      : darkMode
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  <span className="text-sm font-medium">{date.day}</span>
                  <span className="text-xl font-bold my-1">{date.date}</span>

                  {date.isToday && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                        selectedDate === date.fullDate
                          ? "bg-white text-purple-600"
                          : darkMode
                          ? "bg-purple-500 text-white"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {t("आज", "Today")}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </div>

      {selectedDate && (
        <>
          <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
            {t(
              `${formatMonthDay(
                selectedDate,
                locale
              )} को लागि थिएटर र शो-समय चयन गर्नुहोस्`,
              `Select Theater & Showtime for ${formatMonthDay(
                selectedDate,
                locale
              )}`
            )}
          </h2>

          {isLoadingShowtimes ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : theatersAndShowtimes && theatersAndShowtimes.length > 0 ? (
            <div className="space-y-6">
              {theatersAndShowtimes.map((item) => {
                if (!item || !item.theater) return null;

                return (
                  <div
                    key={item.theater._id}
                    className={`rounded-xl overflow-hidden shadow-md ${
                      darkMode ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <div
                      className={`p-4 border-b ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <h3 className="font-bold text-lg">
                        {t(item.theater.nameNepali, item.theater.name)}
                      </h3>
                      <p
                        className={`text-sm flex items-center ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        <FaMapMarkerAlt className="mr-1" />
                        {t(
                          item.theater.locationNepali,
                          item.theater.location
                        )}, {item.theater.city}
                      </p>
                    </div>

                    <div className="p-4">
                      <div className="flex flex-wrap gap-3">
                        {item.showtimes?.map((show) => {
                          return (
                            <button
                              key={show._id}
                              onClick={() =>
                                onShowtimeSelect({
                                  ...show,
                                  theater: item.theater,
                                })
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                                selectedShowtime?._id === show._id
                                  ? "bg-purple-600 text-white border-purple-700 scale-105 shadow-lg"
                                  : darkMode
                                  ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                                  : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                              }`}
                            >
                              <div>{formatTime(show.startTime, locale)}</div>
                              <div className="text-xs mt-1">
                                {show.currency || "NRs."}{" "}
                                {show.ticketPrice?.standard ||
                                  show.ticketPrice ||
                                  t("उपलब्ध छैन", "N/A")}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">
              {t(
                "चयन गरिएको मितिको लागि कुनै शो-समय उपलब्ध छैन।",
                "No showtimes available for the selected date."
              )}{" "}
            </p>
          )}
        </>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNextStep}
          disabled={!selectedShowtime || isLoadingShowtimes}
          className={`px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 flex items-center shadow-md hover:shadow-lg active:scale-95
                        ${
                          !selectedShowtime || isLoadingShowtimes
                            ? darkMode
                              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700 text-white"
                        }`}
        >
          {t("जारी राख्नुहोस्", "Continue")}{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Step1_DateTimeSelection;
