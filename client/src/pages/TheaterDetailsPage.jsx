import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { FiArrowLeft, FiFilm, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { getImageUrl } from "../services/utils";

function TheaterDetailsPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { darkMode } = useTheme();

  const [theater, setTheater] = useState(null);
  const [currentMovies, setCurrentMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const fetchTheaterDetails = async () => {
    try {
      const response = await api.get(`/theaters/${id}`);
      if (response.data.success) {
        setTheater(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching theater details:", error);
      showToast(
        t("सिनेमा हल विवरण लोड गर्न त्रुटि", "Error loading theater details"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentMovies = async () => {
    try {
      const response = await api.get(`/showtimes?theaterId=${id}`);
      console.log("Showtimes response:", response.data);

      if (response.data.success) {
        const uniqueMovies = [];
        const movieIds = new Set();

        response.data.data.forEach((theaterData) => {
          // Each theaterData has a showtimes array
          if (theaterData.showtimes && Array.isArray(theaterData.showtimes)) {
            theaterData.showtimes.forEach((showtime) => {
              if (showtime.movie && !movieIds.has(showtime.movie._id)) {
                movieIds.add(showtime.movie._id);
                uniqueMovies.push(showtime.movie);
              }
            });
          }
        });
        console.log("Unique movies found:", uniqueMovies);
        setCurrentMovies(uniqueMovies);
      }
    } catch (error) {
      console.error("Error fetching current movies:", error);
    }
  };

  const getTheaterImage = (imageObject) => {
    return imageObject.url;
  };

  useEffect(() => {
    if (id) {
      fetchTheaterDetails();
      fetchCurrentMovies();
    }
  }, [id]);

  if (loading) {
    return (
      <div
        className={`min-h-screen  ${
          darkMode ? "bg-gray-900" : "bg-gray-300"
        }} py-8`}
      >
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`}>
          <div className={`animate-pulse`}>
            <div
              className={`h-8  ${
                darkMode ? "bg-gray-600" : "bg-gray-300"
              }} rounded w-1/4 mb-8`}
            ></div>
            <div
              className={`h-64  ${
                darkMode ? "bg-gray-600" : "bg-gray-300"
              }} rounded-lg mb-8`}
            ></div>
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8`}>
              <div className={`lg:col-span-2 space-y-4`}>
                <div
                  className={`h-6  ${
                    darkMode ? "bg-gray-600" : "bg-gray-300"
                  }} rounded`}
                ></div>
                <div
                  className={`h-4  ${
                    darkMode ? "bg-gray-600" : "bg-gray-300"
                  }} rounded w-3/4`}
                ></div>
                <div
                  className={`h-4  ${
                    darkMode ? "bg-gray-600" : "bg-gray-300"
                  }} rounded w-1/2`}
                ></div>
              </div>
              <div className={`space-y-4`}>
                <div
                  className={`h-6  ${
                    darkMode ? "bg-gray-600" : "bg-gray-300"
                  }} rounded`}
                ></div>
                <div
                  className={`h-32  ${
                    darkMode ? "bg-gray-600" : "bg-gray-300"
                  }} rounded`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!theater) {
    return (
      <div
        className={`min-h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        } flex items-center justify-center`}
      >
        <div className="text-center">
          <h2
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            } mb-4`}
          >
            {t("सिनेमा हल फेला परेन", "Theater not found")}
          </h2>
          <Link
            to={"/theaters"}
            className={`${
              darkMode
                ? "text-red-400 hover:text-red-300"
                : "text-red-600 hover:text-red-700"
            }`}
          >
            {t("सिनेमा हलहरूमा फर्कनुहोस्", "Back to Theaters")}
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} py8`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={"/theaters"}
          className={`inline-flex items-center ${
            darkMode
              ? "text-red-400 hover:text-red-300"
              : "text-red-600 hover:text-red-700"
          } mb-6 transition-colors duration-200`}
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          {t("सिनेमा हलहरूमा फर्कनुहोस्", "Back to Theaters")}
        </Link>

        {theater.images && theater.images.length > 0 && (
          <div className="mb-8">
            <div className="relative h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden">
              <img
                src={getTheaterImage(theater.images[selectedImageIndex])}
                alt={theater.name}
                className="w-full h-full object-cover"
              />

              {theater.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {theater.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                        index === selectedImageIndex
                          ? "bg-white"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            {theater.images.length > 1 && (
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {theater.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                      index === selectedImageIndex
                        ? "border-red-500"
                        : ` ${
                            darkMode ? "border-gray-600" : "border-gray-300"
                          } hover:border-red-300`
                    }`}
                  >
                    <img
                      src={getTheaterImage(image)}
                      alt={`${theater.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-lg p-6 mb-6`}
            >
              <h1
                className={`text-3xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                } mb-4`}
              >
                {theater.name}
              </h1>

              <div className="space-y-3 mb-6">
                <div
                  className={`flex items-center ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <FiMapPin className="w-5 h-5 mr-3 shrink-0" />
                  <span>{theater.location}</span>
                </div>
                {theater.contact?.phone && (
                  <div
                    className={`flex items-center ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <FiPhone className="w-5 h-5 mr-3 shrink-0" />

                    <a
                      href={`tel:${theater.contact.phone}`}
                      className={`${
                        darkMode ? "hover:text-red-400" : "hover:text-red-600"
                      } transition-colors duration-200`}
                    >
                      {theater.contact.phone}
                    </a>
                  </div>
                )}

                {theater.contact?.email && (
                  <div
                    className={`flex items-center  ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <FiMail className="w-5 h-5 mr-3 shrink-0" />
                    <a
                      href={`mailto:${theater.contact.email}`}
                      className={` ${
                        darkMode ? "hover:text-red-400" : "hover:text-red-600"
                      }transition-colors duration-200`}
                    >
                      {theater.contact.email}
                    </a>
                  </div>
                )}
              </div>

              {/* screens info */}
              {theater.screens && theater.screens.length > 0 && (
                <div className="mb-6">
                  <h3
                    className={`text-xl font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-3`}
                  >
                    {t("स्क्रिनहरू", "Screens")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {theater.screens.map((screen, index) => (
                      <div
                        key={index}
                        className={`${
                          darkMode ? "bg-gray-700" : "bg-gray-50"
                        } rounded-lg p-4`}
                      >
                        <h4
                          className={`font-medium ${
                            darkMode ? "text-white" : "text-gray-900"
                          } mb-2
                        `}
                        >
                          {screen.name}
                        </h4>
                        <div
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }space-y-1`}
                        >
                          <p>
                            {t("पङ्क्तिहरू", "Rows")}: {screen.rows}
                          </p>
                          <p>
                            {t("प्रति पङ्क्ति सिटहरू", "Seats per row")}:{" "}
                            {screen.seatsPerRow}
                          </p>
                          <p>
                            {t("कुल सिटहरू", "Total seats")}:{" "}
                            {screen.rows * screen.seatsPerRow}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {theater.amenities && theater.amenities.length > 0 && (
                <div>
                  <h3
                    className={`text-xl font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-3`}
                  >
                    {t("सुविधाहरू", "Facilities")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {theater.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className={`inline-block  ${
                          darkMode
                            ? "bg-red-900/30 text-red-300"
                            : "bg-red-100 text-red-800"
                        } px-3 py-1 rounded-full text-sm`}
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* current movies */}
            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-lg p-6`}
            >
              <h2
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                } mb-4`}
              >
                {t("हालका चलचित्रहरू", "Current Movies")}
              </h2>

              {currentMovies.length === 0 ? (
                <p
                  className={` ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  {t(
                    "हाल कुनै चलचित्र देखाइएको छैन",
                    "No movies currently showing"
                  )}
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {currentMovies.map((movie) => (
                    <Link
                      key={movie._id}
                      to={`/movies/${movie._id}`}
                      className="group"
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                        <img
                          src={getImageUrl(movie.posterImage)}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3
                        className={`text-sm font-medium  ${
                          darkMode
                            ? "text-white group-hover:text-red-400"
                            : "text-gray-900 group-hover:text-red-600"
                        }transition-colors duration-200 line-clamp-2`}
                      >
                        {movie.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* sidebar */}
          <div className="space-y-6">
            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-lg p-6`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t("छिटो कार्यहरू", "Quick Actions")}
              </h3>
              <div className="space-y-3">
                <Link
                  to={`/theaters/${theater._id}/shows`}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                >
                  <FiFilm className="w-5 h-5 mr-2" />
                  {t("शोहरू हेर्नुहोस्", "View Shows")}
                </Link>
                <button
                  onClick={() =>
                    window.open(
                      `https://maps.google.com/?q=${encodeURIComponent(
                        theater.name + "," + theater.location
                      )}`,
                      "_blank"
                    )
                  }
                  className={`w-full ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  } py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center`}
                >
                  <FiMapPin className="w-5 h-5 mr-2" />
                  {t("दिशा निर्देशन पाउनुहोस्", "Get Directions")}
                </button>
              </div>
            </div>

            {/* seats */}
            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-lg p-6`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t("सिनेमा हल जानकारी", "Theater Information")}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span
                    className={` ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {t("कुल स्क्रिनहरू", "Total Screens")}:
                  </span>
                  <span
                    className={`font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {theater.screens?.length || 0}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span
                    className={` ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {t("कुल सिटहरू", "Total Seats")}:
                  </span>
                  <span
                    className={`font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {theater.screens?.reduce(
                      (total, screen) =>
                        total + screen.rows * screen.seatsPerRow,
                      0
                    ) || 0}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span
                    className={` ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {" "}
                    {t("हालका चलचित्रहरू", "Current Movies")}:
                  </span>
                  <span
                    className={`font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {" "}
                    {currentMovies.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TheaterDetailsPage;
