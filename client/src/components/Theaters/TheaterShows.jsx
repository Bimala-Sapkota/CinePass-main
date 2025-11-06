import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiCalendar,
  FiChevronLeft,
  FiFilm,
} from "react-icons/fi";
import { formatTime, formatMonthDay, getImageUrl } from "../../services/utils";

// Reuse the getDates function from BookingPage
const getDates = (numberOfDays = 7, language = "en") => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < numberOfDays; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const formattedFullDate = `${year}-${month}-${day}`;

    let dayName;
    if (language === "np") {
      const nepaliDays = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];
      dayName = nepaliDays[currentDate.getDay()];
    } else {
      dayName = currentDate.toLocaleDateString("en-US", { weekday: "short" });
    }

    const dayNumber = currentDate.getDate();
    const isCurrentCalendarToday = i === 0;

    dates.push({
      fullDate: formattedFullDate,
      day: dayName,
      date: dayNumber,
      isToday: isCurrentCalendarToday,
    });
  }
  return dates;
};

function TheaterShows() {
  const { theaterId } = useParams();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [theater, setTheater] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [datesForSelection, setDatesForSelection] = useState([]);

  const locale = language === "np" ? "ne-NP" : "en-US";

  useEffect(() => {
    window.scrollTo(0, 0);
    const dates = getDates(7, language);
    setDatesForSelection(dates);
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0].fullDate);
    }
  }, [language]);

  useEffect(() => {
    if (theaterId && selectedDate) {
      fetchTheaterAndShows();
    }
  }, [theaterId, selectedDate]);

  const fetchTheaterAndShows = async () => {
    try {
      setLoading(true);

      // Fetch theater details
      const theaterResponse = await api.get(`/theaters/${theaterId}`);
      if (theaterResponse.data.success) {
        setTheater(theaterResponse.data.data);
      }

      // Fetch showtimes for this theater
      const showtimesResponse = await api.get(
        `/showtimes?theaterId=${theaterId}&date=${selectedDate}`
      );

      if (showtimesResponse.data.success) {
        setShowtimes(showtimesResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast(t("डेटा लोड गर्न त्रुटि", "Error loading data"), "error");
    } finally {
      setLoading(false);
    }
  };

  const groupShowtimesByMovie = useMemo(() => {
    if (!showtimes.length) return [];

    const grouped = {};

    showtimes.forEach((theaterData) => {
      if (theaterData.showtimes) {
        theaterData.showtimes.forEach((showtime) => {
          const movieId = showtime.movie._id;
          if (!grouped[movieId]) {
            grouped[movieId] = {
              movie: showtime.movie,
              shows: [],
            };
          }
          grouped[movieId].shows.push(showtime);
        });
      }
    });

    return Object.values(grouped);
  }, [showtimes]);

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`${
            darkMode ? "bg-gray-800" : "bg-white"
          } rounded-xl p-6 animate-pulse`}
        >
          <div className="flex gap-4">
            <div
              className={`w-24 h-36 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-300"
              }`}
            />
            <div className="flex-1 space-y-3">
              <div
                className={`h-6 w-1/3 rounded ${
                  darkMode ? "bg-gray-700" : "bg-gray-300"
                }`}
              />
              <div
                className={`h-4 w-1/4 rounded ${
                  darkMode ? "bg-gray-700" : "bg-gray-300"
                }`}
              />
              <div className="flex gap-2 mt-4">
                {[1, 2, 3, 4].map((j) => (
                  <div
                    key={j}
                    className={`h-10 w-20 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div
        className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!theater) {
    return (
      <div
        className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p
            className={`text-lg ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t("थिएटर फेला परेन", "Theater not found")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header with Theater Info */}
      <div
        className={`${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-sm border-b ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 mb-4 ${
              darkMode
                ? "text-gray-300 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            } transition-colors`}
          >
            <FiChevronLeft className="w-5 h-5" />
            <span>{t("पछाडि जानुहोस्", "Go Back")}</span>
          </button>

          {/* Theater Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1
                className={`text-2xl sm:text-3xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t(theater.nameNepali, theater.name)}
              </h1>
              <div className="flex flex-wrap gap-4 mt-2">
                <div
                  className={`flex items-center gap-2 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <FiMapPin className="w-4 h-4" />
                  <span className="text-sm">{theater.location}</span>
                </div>
                {theater.contact?.phone && (
                  <div
                    className={`flex items-center gap-2 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <FiPhone className="w-4 h-4" />
                    <span className="text-sm">{theater.contact.phone}</span>
                  </div>
                )}
                {theater.contact?.email && (
                  <div
                    className={`flex items-center gap-2 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <FiMail className="w-4 h-4" />
                    <span className="text-sm">{theater.contact.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {theater.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {theater.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-xs ${
                      darkMode
                        ? "bg-purple-900/30 text-purple-300"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Selection */}
        <div className="mb-8">
          <h2
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {t("मिति छान्नुहोस्", "Select Date")}
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {datesForSelection.map((date) => (
              <button
                key={date.fullDate}
                onClick={() => setSelectedDate(date.fullDate)}
                className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg min-w-[80px] sm:min-w-[90px] cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg ${
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
            ))}
          </div>
        </div>

        {/* Movies and Showtimes */}
        <div className="space-y-6">
          {groupShowtimesByMovie.length === 0 ? (
            <div
              className={`text-center py-12 ${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl`}
            >
              <FiFilm
                className={`w-16 h-16 mx-auto mb-4 ${
                  darkMode ? "text-gray-600" : "text-gray-300"
                }`}
              />
              <p
                className={`text-lg ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {t(
                  "यस मितिमा कुनै शो उपलब्ध छैन",
                  "No shows available on this date"
                )}
              </p>
            </div>
          ) : (
            groupShowtimesByMovie.map(({ movie, shows }) => (
              <div
                key={movie._id}
                className={`${
                  darkMode ? "bg-gray-800" : "bg-white"
                } rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow`}
              >
                <div className="p-6">
                  <div className="flex gap-4">
                    {/* Movie Poster */}
                    <Link
                      to={`/movies/${movie._id}`}
                      className="flex-shrink-0 group"
                    >
                      <img
                        src={getImageUrl(movie.posterImage)}
                        alt={movie.title}
                        className="w-24 h-36 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Movie Info and Showtimes */}
                    <div className="flex-1">
                      <Link
                        to={`/movies/${movie._id}`}
                        className="group inline-block"
                      >
                        <h3
                          className={`text-xl font-bold mb-1 ${
                            darkMode
                              ? "text-white group-hover:text-purple-400"
                              : "text-gray-900 group-hover:text-purple-600"
                          } transition-colors`}
                        >
                          {t(movie.titleNepali, movie.title)}
                        </h3>
                      </Link>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {movie.duration} {t("मिनेट", "mins")}
                        </span>
                        <span
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {movie.genre}
                        </span>
                        {movie.certification && (
                          <span
                            className={`px-2 py-0.5 text-xs rounded ${
                              darkMode
                                ? "bg-yellow-900/30 text-yellow-300"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {movie.certification}
                          </span>
                        )}
                      </div>

                      {/* Showtimes */}
                      <div>
                        <p
                          className={`text-sm font-medium mb-2 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {t("उपलब्ध समयहरू", "Available Times")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {shows
                            .sort(
                              (a, b) =>
                                new Date(a.startTime) - new Date(b.startTime)
                            )
                            .map((show) => (
                              <Link
                                key={show._id}
                                to={`/booking/${movie._id}`}
                                state={{ preSelectedShowtime: show }}
                                className={`px-4 py-2 rounded-lg border transition-all ${
                                  darkMode
                                    ? "bg-gray-700 border-gray-600 hover:bg-purple-600 hover:border-purple-600 hover:text-white"
                                    : "bg-gray-50 border-gray-300 hover:bg-purple-600 hover:border-purple-600 hover:text-white"
                                } group`}
                              >
                                <div className="flex items-center gap-2">
                                  <FiClock className="w-4 h-4" />
                                  <span className="font-medium">
                                    {formatTime(show.startTime, locale)}
                                  </span>
                                </div>
                                <div
                                  className={`text-xs mt-1 ${
                                    darkMode ? "text-gray-400" : "text-gray-600"
                                  } group-hover:text-white`}
                                >
                                  {show.screen} • {show.currency || "NRs."}{" "}
                                  {show.ticketPrice?.standard ||
                                    show.ticketPrice ||
                                    t("उपलब्ध छैन", "N/A")}
                                </div>
                              </Link>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Theater Images Section */}
        {theater.images && theater.images.length > 0 && (
          <div className="mt-12">
            <h2
              className={`text-xl font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t("थिएटर तस्वीरहरू", "Theater Images")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {theater.images.map((image, index) => (
                <div
                  key={index}
                  className={`rounded-lg overflow-hidden ${
                    darkMode ? "bg-gray-800" : "bg-gray-200"
                  }`}
                >
                  <img
                    src={typeof image === "string" ? image : image.url}
                    alt={`${theater.name} - ${index + 1}`}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Theater Details Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Screens Info */}
          {theater.screens && theater.screens.length > 0 && (
            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl p-6 shadow-lg`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t("स्क्रिन जानकारी", "Screen Information")}
              </h3>
              <div className="space-y-3">
                {theater.screens.map((screen, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      darkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <span
                      className={`font-medium ${
                        darkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      {screen.name}
                    </span>
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {screen.rows * screen.seatsPerRow} {t("सिटहरू", "seats")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact & Location */}
          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } rounded-xl p-6 shadow-lg`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t("सम्पर्क जानकारी", "Contact Information")}
            </h3>
            <div className="space-y-3">
              <div
                className={`flex items-start gap-3 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <FiMapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p>{theater.location}</p>
                  <p className="text-sm">{theater.city}</p>
                </div>
              </div>
              {theater.contact?.phone && (
                <div
                  className={`flex items-center gap-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <FiPhone className="w-5 h-5" />
                  <a
                    href={`tel:${theater.contact.phone}`}
                    className="hover:underline"
                  >
                    {theater.contact.phone}
                  </a>
                </div>
              )}
              {theater.contact?.email && (
                <div
                  className={`flex items-center gap-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <FiMail className="w-5 h-5" />
                  <a
                    href={`mailto:${theater.contact.email}`}
                    className="hover:underline"
                  >
                    {theater.contact.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TheaterShows;
