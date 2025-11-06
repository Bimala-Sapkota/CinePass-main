import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useState } from "react";
import api from "../../services/api";
import { useEffect } from "react";
import {
  FiAward,
  FiCalendar,
  FiCamera,
  FiClock,
  FiEdit3,
  FiFilm,
  FiHeart,
  FiMail,
  FiPhone,
  FiSettings,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";
import { getImageUrl } from "../../services/utils";
import { Link } from "react-router";

function UserDashboardPage() {
  const { user, updateProfile, updateAvatar } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { darkMode } = useTheme();

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totolBookings: 0,
    totalSpent: 0,
    favoriteGenres: [],
    recentActivity: [],
  });

  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    preferredLanguage: user?.preferredLanguage || "english",
  });

  useEffect(() => window.scrollTo(0, 0), []);

  const fetchUserStats = async () => {
    try {
      const totalSpent = recentBookings.reduce(
        (sum, booking) => sum + booking.totalPrice,
        0
      );

      setStats({
        totalBookings: recentBookings.length,
        totalSpent: totalSpent,
        favoriteGenres: [],
        recentActivity: [],
      });
    } catch (error) {
      console.error("Error calculating user stats:", error);
    }
  };

  // const fetchFavoriteMovies = async () => {
  //   try {
  //     const response = await api.get("/watchlist");
  //     if (response.data.success) {
  //       setFavoriteMovies(response.data.data || []);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching favorite movies:", error);
  //   }
  // };

  // const fetchRecentBookings = async () => {
  //   try {
  //     const response = await api.get("/bookings/my-bookings?limit=5");
  //     if (response.data.success) {
  //       setRecentBookings(response.data.data || []);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching recent bookings:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fetchRecommendations = async () => {
  //   try {
  //     const response = await api.get("/recommendations");
  //     if (response.data.success) {
  //       setRecommendations((response.data.data || []).slice(0, 6));
  //     }
  //   } catch (error) {
  //     console.error("Error fetching recommendations:", error);
  //   }
  // };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [favRes, bookRes, recRes] = await Promise.all([
          api.get("/watchlist"),
          api.get("/bookings/my-bookings?limit=5"),
          api.get("/recommendations?limit=6"),
        ]);

        if (favRes.data.success) setFavoriteMovies(favRes.data.data || []);
        if (bookRes.data.success) setRecentBookings(bookRes.data.data || []);
        if (recRes.data.success) setRecommendations(recRes.data.data || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        showToast(
          t("ड्यासबोर्ड डाटा लोड गर्न सकिएन", "Could not load dashboard data"),
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [user]);

  useEffect(() => {
    if (recentBookings.length > 0) {
      const totalSpent = recentBookings.reduce(
        (sum, booking) => sum + booking.totalPrice,
        0
      );

      setStats({
        totalBookings: recentBookings.length,
        totalSpent: totalSpent,
        favoriteGenres: [],
        recentActivity: [],
      });
    }
  }, [recentBookings]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        preferredLanguage: user.preferredLanguage || "english",
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab !== "settings") setIsEditingProfile(false);
  }, [activeTab]);

  useEffect(() => {
    setIsEditingProfile(false);
  }, [user, activeTab]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    await updateProfile(profileForm);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast(
        t("कृपया छवि फाइल चयन गर्नुहोस्", "Please select an image file"),
        "error"
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast(
        t("फाइल साइज ५MB भन्दा कम हुनुपर्छ", "File size must be less than 5MB"),
        "error"
      );
      return;
    }

    try {
      const response = await updateAvatar(file);
      if (response) {
        showToast(
          t("अवतार सफलतापूर्वक अपडेट भयो", "Avatar updated successfully"),
          "success"
        );
      }
    } catch (error) {
      console.error("Avatar update error:", error);
      showToast(
        t("अवतार अपडेट गर्न सकिएन", "Failed to update avatar"),
        "error"
      );
    }
  };
  const formatCurrency = (ammount) => `NRs. ${ammount.toLocaleString()}`;

  const tabs = [
    { id: "overview", label: t("सिंहावलोकन", "Overview"), icon: FiUser },
    { id: "bookings", label: t("बुकिङहरू", "Bookings"), icon: FiCalendar },
    { id: "favorites", label: t("मनपर्नेहरू", "Favorites"), icon: FiHeart },
    { id: "settings", label: t("सेटिङहरू", "Setings"), icon: FiSettings },
  ];

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} py-8`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`${
            darkMode ? "bg-gray-800" : "bg-white"
          } rounded-lg shadow-lg overflow-hidden mb-8 `}
        >
          <div className="relative h-32 bg-gradient-to-r from-red-500 to-red-700">
            <div className={`absolute inset-0 bg-black/20 `}></div>
          </div>

          <div className="relative px-6 pb-6">
            {/* avatar */}
            <div className="absolute -top-16 left-6">
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={getImageUrl(user.avatar)}
                    alt="user avatar"
                    className={`w-24 h-24 rounded-full border-4 object-cover ${
                      darkMode ? "border-gray-800" : "border-white"
                    } `}
                  />
                ) : (
                  <div
                    className={`w-24 h-24 rounded-full border-4 ${
                      darkMode ? "border-gray-800" : "border-white"
                    } bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center`}
                  >
                    <span className="text-white text-2xl font-bod">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}

                {/* Camera Icon for Avatar Change */}
                <label
                  className={`absolute bottom-0 right-0  ${
                    darkMode
                      ? "bg-gray-800 hover:bg-gray-700 "
                      : "bg-white hover:bg-gray-50 "
                  } rounded-full p-1.5 shadow-lg cursor-pointer transition-colors duration-200`}
                >
                  <FiCamera
                    className={`w-4 h-4  ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    } `}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* User info */}
            <div className="pt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1
                  className={`text-2xl font-bold  ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {user?.username}
                </h1>
                <p
                  className={`${darkMode ? "text-gray-300" : "text-gray-600 "}`}
                >
                  {user?.email}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500 "
                  } mt-1`}
                >
                  {t("", "Member since ")}
                  {new Date(user?.createdAt).getFullYear()}{" "}
                  {t("देखि सदस्य भए", "")}
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab("settings");
                  setIsEditingProfile(true);
                }}
                className="mt-4 sm:mt-0 inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <FiEdit3 className={`w-4 h-4 mr-2`} />
                {t("प्रोफाइल सम्पादन गर्नुहोस्", "Edit Profile")}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          className={`${
            darkMode ? "bg-gray-800" : "bg-white"
          } rounded-lg shadow-lg mb-8`}
        >
          <div
            className={`border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? `border-red-500 ${
                          darkMode ? "text-red-400" : "text-red-600"
                        }`
                      : `border-transparent ${
                          darkMode
                            ? "text-gray-400 hover:text-gray-300 border-gray-600"
                            : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {/* Overview tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div
                    className={`bg-gradient-to-br rounded-lg p-6 border ${
                      darkMode
                        ? "from-blue-900/20 to-blue-800/20 border-blue-800"
                        : "from-blue-50 to-blue-100 border-blue-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <FiCalendar
                        className={`w-8 h-8 ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                      <div className="ml-4">
                        <p
                          className={`text-2xl font-bold  ${
                            darkMode ? "text-blue-100" : "text-blue-900"
                          }`}
                        >
                          {recentBookings.length}
                        </p>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-blue-300" : "text-blue-700"
                          }`}
                        >
                          {t("कुल बुकिङहरू", "Total Bookings")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-6 border rounded-lg bg-gradient-to-br ${
                      darkMode
                        ? "from-green-900/20 to-green-800/20 border-green-800"
                        : "from-green-50 to-green-100 border-green-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <FiTrendingUp
                        className={`w-8 h-8 ${
                          darkMode ? "text-green-400" : "text-green-600 "
                        }`}
                      />
                      <div className="ml-4">
                        <p
                          className={`text-2xl font-bold ${
                            darkMode ? "text-green-100" : "text-green-900 "
                          }`}
                        >
                          {formatCurrency(
                            recentBookings.reduce(
                              (sum, booking) => sum + booking.totalPrice,
                              0
                            )
                          )}
                        </p>
                        <p
                          className={` ${
                            darkMode ? "text-green-300" : "text-green-700"
                          } text-sm`}
                        >
                          {t("कुल खर्च", "Total Spent")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-6 rounded-lg border bg-gradient-to-br ${
                      darkMode
                        ? "from-purple-900/20 to-purple-800/20 border-purple-800"
                        : "from-purple-50 to-purple-100 border-purple-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <FiHeart
                        className={`w-8 h-8 ${
                          darkMode ? "text-purple-400" : "text-purple-600 "
                        }`}
                      />
                      <div className="ml-4">
                        <p
                          className={`text-2xl font-bold ${
                            darkMode ? "text-purple-100" : "text-purple-900 "
                          }`}
                        >
                          {favoriteMovies.length}
                        </p>
                        <p
                          className={` ${
                            darkMode ? "text-purple-300" : "text-purple-700"
                          } text-sm`}
                        >
                          {t("मनपर्ने चलचित्रहरू", "Favorite Movies")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-6 rounded-lg border bg-gradient-to-br ${
                      darkMode
                        ? "from-yellow-900/20 to-yellow-800/20 border-yellow-800"
                        : "from-yellow-50 to-yellow-100 border-yellow-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <FiAward
                        className={`w-8 h-8 ${
                          darkMode ? "text-yellow-400" : "text-yellow-600 "
                        }`}
                      />
                      <div className="ml-4">
                        <p
                          className={`text-2xl font-bold ${
                            darkMode ? "text-yellow-100" : "text-yellow-900 "
                          }`}
                        >
                          {user?.role === "admin" ? "VIP" : "Member"}
                        </p>
                        <p
                          className={` ${
                            darkMode ? "text-yellow-300" : "text-yellow-700"
                          } text-sm`}
                        >
                          {t("स्थिति", "Status")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bookings */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className={`text-lg font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {t("हालका बुकिङहरू", "Recent Bookings")}
                      </h3>

                      <Link
                        to={"/my-tickets"}
                        className={`text-sm font-medium ${
                          darkMode
                            ? "text-red-400 hover:text-red-300"
                            : "text-red-600 hover:text-red-700"
                        }`}
                      >
                        {t("सबै हेर्नुहोस्", "View All")}
                      </Link>
                    </div>

                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse flex space-x-3">
                            <div
                              className={`w-12 h-16 ${
                                darkMode ? "bg-gray-600" : "bg-gray-300"
                              } rounded`}
                            ></div>
                            <div className="flex-1 space-y-2 py-1">
                              <div
                                className={`h-4 ${
                                  darkMode ? "bg-gray-600" : "bg-gray-300"
                                } rounded w-3/4`}
                              ></div>
                              <div
                                className={`h-3 ${
                                  darkMode ? "bg-gray-600" : "bg-gray-300"
                                } rounded w-1/2`}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recentBookings.length === 0 ? (
                      <div className={`text-center py-8`}>
                        <FiCalendar
                          className={`w-12 h-12 mx-auto mb-3 ${
                            darkMode ? "text-gray-600" : "text-gray-300"
                          }`}
                        />
                        <p
                          className={`${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {t("हालका कुनै बुकिङहरू छैनन्", "No recent bookings")}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentBookings.slice(0, 3).map((booking) => (
                          <div
                            key={booking._id}
                            className={`flex items-center space-x-3 p-3 rounded-lg ${
                              darkMode ? "bg-gray-700" : "bg-gray-50"
                            }`}
                          >
                            <img
                              src={getImageUrl(
                                booking.showtime.movie.posterImage
                              )}
                              alt={booking.showtime.movie.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h4
                                className={`text-sm font-medium truncate ${
                                  darkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {booking.showtime.movie.title}
                              </h4>
                              <p
                                className={`text-xs ${
                                  darkMode ? "text-gray-300" : "text-gray-600"
                                }`}
                              >
                                {booking.showtime.theater.name}
                              </p>
                              <p
                                className={`text-xs ${
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {new Date(
                                  booking.showtime.startTime
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-sm font-medium ${
                                  darkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {formatCurrency(booking.totalPrice)}
                              </p>
                              <p
                                className={`text-xs ${
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {booking.seats.length} {t("सिटहरू", "seats")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recommendations list */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className={`text-lg font-semibold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {t("तपाईंका लागि सिफारिस", "Recommended for You")}
                      </h3>
                      <Link
                        to="/movies"
                        className={`text-sm font-medium ${
                          darkMode
                            ? "text-red-400 hover:text-red-300"
                            : "text-red-600 hover:text-red-700"
                        }`}
                      >
                        {t("सबै ब्राउज गर्नुहोस्", "Browse All")}
                      </Link>
                    </div>
                    {loading && recommendations.length === 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div
                              className={`aspect-[2/3] rounded-lg ${
                                darkMode ? "bg-gray-700" : "bg-gray-300"
                              }`}
                            ></div>
                            <div
                              className={`h-3 ${
                                darkMode ? "bg-gray-700" : "bg-gray-300"
                              } rounded mt-2 w-3/4`}
                            ></div>
                          </div>
                        ))}
                      </div>
                    ) : recommendations.length === 0 ? (
                      <div
                        className={`text-center py-8 rounded-lg ${
                          darkMode ? "bg-gray-800" : "bg-gray-50"
                        }`}
                      >
                        <FiFilm
                          className={`w-12 h-12 mx-auto mb-3 ${
                            darkMode ? "text-gray-600" : "text-gray-300"
                          }`}
                        />
                        <p
                          className={`${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {t("अझै कुनै सिफारिस छैन", "No recommendations yet")}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {recommendations.slice(0, 6).map((movie) => (
                          <Link
                            key={movie._id}
                            to={`/movies/${movie._id}`}
                            className="group"
                          >
                            <div className="aspect-[2/3] rounded-lg overflow-hidden mb-2">
                              <img
                                src={getImageUrl(movie.posterImage)}
                                alt={movie.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.src = "/api/placeholder/300/450";
                                }}
                              />
                            </div>
                            <h4
                              className={`text-xs font-medium line-clamp-2 transition-colors duration-200 ${
                                darkMode
                                  ? "text-white group-hover:text-red-400"
                                  : "text-gray-900 group-hover:text-red-600"
                              }`}
                            >
                              {movie.title}
                            </h4>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* END: Overview Tab  */}
            {/* START: Booking Tab */}
            {activeTab === "bookings" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {t("मेरा बुकिङहरू", "My Bookings")}
                  </h3>
                  <Link
                    to="/my-tickets"
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    {t("विस्तृत इतिहास हेर्नुहोस्", "View Detailed History")}
                  </Link>
                </div>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`animate-pulse p-4 rounded-lg ${
                          darkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        <div className="flex space-x-4">
                          <div
                            className={`w-16 h-20 rounded ${
                              darkMode ? "bg-gray-600" : "bg-gray-300"
                            }`}
                          ></div>
                          <div className="flex-1 space-y-2 py-1">
                            <div
                              className={`h-4 rounded w-3/4 ${
                                darkMode ? "bg-gray-600" : "bg-gray-300"
                              }`}
                            ></div>
                            <div
                              className={`h-3 rounded w-1/2 ${
                                darkMode ? "bg-gray-600" : "bg-gray-300"
                              }`}
                            ></div>
                            <div
                              className={`h-3 rounded w-1/3 ${
                                darkMode ? "bg-gray-600" : "bg-gray-300"
                              }`}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <FiCalendar
                      className={`w-16 h-16 mx-auto mb-4 ${
                        darkMode ? "text-gray-600" : "text-gray-300"
                      }`}
                    />
                    <h4
                      className={`text-xl font-semibold mb-2 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {t("अहिलेसम्म कुनै बुकिङ छैन", "No bookings yet")}
                    </h4>
                    <p
                      className={`mb-6 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {t(
                        "तपाईंका मनपर्ने चलचित्रहरू बुक गर्न सुरु गर्नुहोस्",
                        "Start booking your favorite movies"
                      )}
                    </p>
                    <Link
                      to="/movies"
                      className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                    >
                      <FiFilm className="w-5 h-5 mr-2" />
                      {t("चलचित्रहरू ब्राउज गर्नुहोस्", "Browse Movies")}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => {
                      if (!booking.showtime || !booking.showtime.movie) {
                        return null;
                      }
                      return (
                        <div
                          key={booking._id}
                          className={`p-4 rounded-lg hover:shadow-md transition-shadow duration-200 ${
                            darkMode ? "bg-gray-700" : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <img
                              src={getImageUrl(
                                booking.showtime.movie.posterImage
                              )}
                              alt={booking.showtime.movie.title}
                              className="w-16 h-20 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4
                                className={`text-lg font-semibold mb-1 ${
                                  darkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {booking.showtime.movie.title}
                              </h4>
                              <p
                                className={`mb-2 ${
                                  darkMode ? "text-gray-300" : "text-gray-600"
                                }`}
                              >
                                {booking.showtime.theater.name}
                              </p>
                              <div
                                className={`flex items-center space-x-4 text-sm ${
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                <div className="flex items-center">
                                  <FiCalendar className="w-4 h-4 mr-1" />{" "}
                                  {new Date(
                                    booking.showtime.startTime
                                  ).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <FiClock className="w-4 h-4 mr-1" />{" "}
                                  {new Date(
                                    booking.showtime.startTime
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                <div>
                                  {booking.seats.length} {t("सिटहरू", "seats")}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-lg font-bold ${
                                  darkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {formatCurrency(booking.totalPrice)}
                              </p>
                              <p
                                className={`text-sm capitalize ${
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {booking.status}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {/* END: Bookings Tab */}

            {/* START: Favorites Tab */}
            {activeTab === "favorites" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {t("मनपर्ने चलचित्रहरू", "Favorite Movies")}
                  </h3>
                </div>

                {favoriteMovies.length === 0 ? (
                  <div className="text-center py-12">
                    <FiHeart
                      className={`w-16 h-16 ${
                        darkMode ? "text-white" : "text-gray-900"
                      } mx-auto mb-2`}
                    />
                    <h4
                      className={`text-xl font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      } mb-2`}
                    >
                      {t(
                        "अझै कुनै मनपर्ने चलचित्रहरू छैनन्",
                        "No favorite movies yet"
                      )}
                    </h4>
                    <p
                      className={`${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      } mb-6`}
                    >
                      {t(
                        "तिनीहरूलाई यहाँ हेर्न आफ्ना मनपर्ने चलचित्रहरू थप्नुहोस्",
                        "Add movies to your favorites to see them here"
                      )}
                    </p>
                    <Link
                      to="/movies"
                      className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                    >
                      <FiFilm className="w-5 h-5 mr-2" />
                      {t("चलचित्रहरू खोज्नुहोस्", "Discover Movies")}
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {favoriteMovies.map((favorite) => {
                      if (!favorite.movie) return null;
                      return (
                        <Link
                          key={favorite._id}
                          to={`/movies/${favorite.movie._id}`}
                          className="group"
                        >
                          <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3">
                            <img
                              src={getImageUrl(favorite.movie.posterImage)}
                              alt={favorite.movie.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div> */}
                          </div>
                          <h4
                            className={`text-sm font-medium ${
                              darkMode
                                ? "text-white group-hover:text-red-400"
                                : "text-gray-900 group-hover:text-red-600"
                            } transition-colors duration-200 line-clamp-2 `}
                          >
                            {t(
                              favorite.movie.titleNepali,
                              favorite.movie.title
                            )}
                          </h4>
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            } mt-1`}
                          >
                            {favorite.movie.genre?.join(", ")}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* END: Favorites Tab */}
            {/* START: Settings Tab */}
            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="max-w-2xl">
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  } mb-6`}
                >
                  {t("खाता सेटिङहरू", "Account Settings")}
                </h3>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        className={`block text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700 "
                        } mb-2`}
                      >
                        {t("प्रयोगकर्ता नाम", "Username")}
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={profileForm.username}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              username: e.target.value,
                            })
                          }
                          disabled={!isEditingProfile}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent  ${
                            darkMode
                              ? "border-gray-600 bg-gray-800 text-white disabled:bg-gray-700"
                              : "border-gray-300 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                          }   `}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700 "
                        } mb-2`}
                      >
                        {t("इमेल ठेगाना", "Email Address")}
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              email: e.target.value,
                            })
                          }
                          disabled={!isEditingProfile}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent  ${
                            darkMode
                              ? "border-gray-600 bg-gray-800 text-white disabled:bg-gray-700"
                              : "border-gray-300 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                          }   `}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700 "
                        } mb-2`}
                      >
                        {t("फोन नम्बर", "Phone Number")}
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              phone: e.target.value,
                            })
                          }
                          disabled={!isEditingProfile}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent  ${
                            darkMode
                              ? "border-gray-600 bg-gray-800 text-white disabled:bg-gray-700"
                              : "border-gray-300 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                          }   `}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700 "
                        } mb-2`}
                      >
                        {t("मनपर्ने भाषा", "Preferred Language")}
                      </label>

                      <select
                        value={profileForm.preferredLanguage}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            preferredLanguage: e.target.value,
                          })
                        }
                        disabled={!isEditingProfile}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent  ${
                          darkMode
                            ? "border-gray-600 bg-gray-800 text-white disabled:bg-gray-700"
                            : "border-gray-300 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                        }   `}
                      >
                        <option value="english">English</option>
                        <option value="nepali">नेपाली</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4 pt-6">
                    {isEditingProfile ? (
                      <>
                        <button
                          type="submit"
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                        >
                          {t("परिवर्तनहरू सेभ गर्नुहोस्", "Save Changes")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileForm({
                              username: user?.username || "",
                              email: user?.email || "",
                              phone: user?.phone || "",
                              preferredLanguage:
                                user?.preferredLanguage || "english",
                            });
                          }}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                        >
                          {t("रद्द गर्नुहोस्", "Cancel")}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        {t("प्रोफाइल सम्पादन गर्नुहोस्", "Edit Profile")}
                      </button>
                    )}
                  </div>
                </form>

                {/* Additional Settings */}
                <div
                  className={`me-8 pt-8
                       border-t ${
                         darkMode ? "border-gray-700" : "border-gray-200"
                       }`}
                >
                  <h4
                    className={`text-base font-semibold${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-4`}
                  >
                    {t("अतिरिक्त विकल्पहरू", "Additional Options")}
                  </h4>

                  <div className="space-y-4">
                    <Link
                      to={"/change-password"}
                      className={`flex items-center justify-between p-4 ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-50 hover:bg-gray-100"
                      } rounded-lg  transition-colors duration-200`}
                    >
                      <div className="flex items-center">
                        <FiSettings className="w-5 h-5 text-gray-500 mr-3" />
                        <span
                          className={`${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {t("पासवर्ड परिवर्तन गर्नुहोस्", "Change Password")}
                        </span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </Link>

                    <button
                      className={`flex items-center justify-between w-full p-4 ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-50 hover:bg-gray-100"
                      } rounded-lg transition-colors duration-200`}
                    >
                      <div className="flex items-center">
                        <FiMail className="w-5 h-5 text-gray-500 mr-3" />
                        <span
                          className={` ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {t("इमेल सूचनाहरू", "Email Notifications")}
                        </span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* END: Settings Tab */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboardPage;
