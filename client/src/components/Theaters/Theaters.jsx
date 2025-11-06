import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { FiFilm, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { Link } from "react-router";
function Theater() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { darkMode } = useTheme();

  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTheaters = async () => {
      try {
        setLoading(true);
        const response = await api.get("/theaters");
        if (response.data.success) {
          setTheaters(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching theaters:", error);
        showToast(
          t("सिनेमा हलहरू लोड गर्न त्रुटि", "Error loading theaters"),
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchTheaters();
  }, [showToast, t]);

  const filteredTheaters = useMemo(() => {
    return theaters.filter((theater) => {
      const term = searchTerm.toLowerCase();
      const cityMatch =
        selectedCity === "all" ||
        theater.city.toLowerCase() === selectedCity.toLowerCase();

      const searchMatch =
        !term ||
        theater.name.toLowerCase().includes(term) ||
        theater.location.toLowerCase().includes(term) ||
        (theater.nameNepali &&
          theater.nameNepali.toLowerCase().includes(term)) ||
        (theater.locationNepali &&
          theater.locationNepali.toLowerCase().includes(term));

      return cityMatch && searchMatch;
    });
  }, [theaters, searchTerm, selectedCity]);

  const uniquieCities = useMemo(() => {
    const cities = theaters.map((theater) => theater.city);
    return [...new Set(cities)];
  }, [theaters]);

  const getTheaterImage = useCallback((theater) => {
    if (theater.images && theater.images.length > 0) {
      if (theater.images[0].url) {
        return theater.images[0].url;
      }
      if (typeof theater.images[0] === "string") {
        return theater.images[0];
      }
    }
    return "/default-theater.jpg";
  }, []);

  const TheaterSkeleton = () => (
    <div
      className={`${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-xl shadow-lg overflow-hidden animate-pulse`}
    >
      <div className={`h-48 ${darkMode ? "bg-gray-600" : "bg-gray-300"}`}>
        <div className="p-6">
          <div
            className={`h-6 rounded mb-2 ${
              darkMode ? "bg-gray-600" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`h-4 rounded mb-4 w-3/4 ${
              darkMode ? "bg-gray-600" : "bg-gray-300"
            }`}
          ></div>
          <div className="space-y-2">
            <div
              className={`h-4 rounded w-1/2 ${
                darkMode ? "bg-gray-600" : "bg-orange-300"
              }`}
            ></div>
            <div
              className={`h-4 rounded w-2/3 ${
                darkMode ? "bg-gray-600" : "bg-orange-300"
              }`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen py-8 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1
            className={`text-4xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {" "}
            {t("सबै सिनेमा हलहरू", "All Theaters")}
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t(
              "तपाईंको नजिकका सिनेमा हलहरू पत्ता लगाउनुहोस् र मनपर्ने शोहरू बुक गर्नुहोस्",
              "Discover movie theaters near you and book your favourite shows"
            )}
          </p>
        </div>

        {/* search and filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          {/* search bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder={t("सिनेमा हल खोज्नुहोस्...", "Search theaters...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${
                  darkMode
                    ? "bg-gray-800 placeholder-gray-400 text-white"
                    : "bg-white text-gray-900 placeholder-gray-500"
                } `}
              />
              <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* city filter */}
          <div className="sm:w-48">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${
                darkMode
                  ? "text-white bg-gray-800 border-gray-600"
                  : "text-gray-900 bg-white border-gray-300"
              }`}
            >
              <option value="all">{t("सबै शहरहरू", "All Cities")}</option>
              {uniquieCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <TheaterSkeleton key={index} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredTheaters.length === 0 && (
          <div className="text-center py-12">
            <FiMapPin
              className={`w-16 h-16 mx-auto mb-4 ${
                darkMode ? "text-gray-600" : "text-gray-300"
              }`}
            />
            <h3
              className={`text-xl font-semibold md-2 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t("कुनै सिनेमा हल फेला परेन", "No theaters found")}
            </h3>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} `}>
              {t(
                "तपाईंको खोज वा फिल्टर समायोजन गर्ने प्रयास गर्नुहोस्",
                "Try adjusting your search or filters"
              )}
            </p>
          </div>
        )}

        {/* Theaters */}
        {!loading && filteredTheaters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTheaters.map((theater) => (
              <div
                key={theater._id}
                className={`${
                  darkMode ? "bg-gray-800" : "bg-white"
                } rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group`}
              >
                {/* image */}
                <div
                  className={`relative h-48 overflow-hidden ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <img
                    loading="lazy"
                    src={getTheaterImage(theater)}
                    alt={theater.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Link
                      to={`/theaters/${theater._id}`}
                      className="bg-white text-red-600 px-6 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors duration-200"
                    >
                      {t("विवरण हेर्नुहोस्", "View Details")}
                    </Link>
                  </div>
                </div>

                {/* theater info */}
                <div className="p-6">
                  <h3
                    className={`font-bold mb-2 transition-colors duration-200 ${
                      darkMode
                        ? "text-white group-hover:text-red-400"
                        : "text-gray-900 group-hover:red-600"
                    }`}
                  >
                    {t(theater.nameNepali, theater.name)}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div
                      className={`flex items-center ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      <FiMapPin className="w-4 h-4 mr-2 shrink-0" />
                      <span className="text-sm">{theater.location}</span>
                    </div>

                    {theater.contact?.phone && (
                      <div
                        className={`flex items-center ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <FiPhone className="w-4 h-4 mr-2 shrink-0" />
                        <span className="text-sm">{theater.contact.phone}</span>
                      </div>
                    )}

                    {theater.contact?.email && (
                      <div
                        className={`flex items-center ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <FiMail className="w-4 h-4 mr-2 flex-0" />
                        <span className="text-sm">{theater.contact.email}</span>
                      </div>
                    )}
                  </div>

                  {theater.amenities?.length > 0 && (
                    <div className="mb-4">
                      <p
                        className={`text-sm font-medium ${
                          darkMode ? "text-white" : "text-gray-900"
                        } mb-2`}
                      >
                        {t("सुविधाहरू", "Facilities")}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {theater.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className={`inline-block  ${
                              darkMode
                                ? "bg-red-900/30 text-red-300"
                                : "bg-red-100 text-red-800 "
                            } text-xs px-2 py-1 rounded`}
                          >
                            {amenity}
                          </span>
                        ))}
                        {theater.amenities.length > 3 && (
                          <span
                            className={`inline-block${
                              darkMode
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-100 text-gray-600"
                            }  text-xs px-2 py-1 rounded`}
                          >
                            +{theater.amenities.length - 3} {t("थप", "more")}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Screens Info */}
                  {theater.screens && theater.screens.length > 0 && (
                    <div className="mb-4">
                      <div
                        className={`flex items-center  ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <FiFilm className="w-4 h-4 mr-2" />
                        <span className="text-sm">
                          {theater.screens.length} {t("स्क्रिनहरू", "Screens")}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 mt-4">
                    <Link
                      to={`/theaters/${theater._id}`}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                    >
                      {t("विवरण हेर्नुहोस्", "View Details")}
                    </Link>
                    <Link
                      to={`/theaters/${theater._id}/shows`}
                      className={`flex-1 ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      } text-center py-2 px-4 rounded-lg font-medium transition-colors duration-200`}
                    >
                      {t("शोहरू", "Shows")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Theater;
