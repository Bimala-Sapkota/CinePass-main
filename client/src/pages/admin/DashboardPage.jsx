import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import {
  FaUsers,
  FaFilm,
  FaTicketAlt,
  FaMoneyBillWave,
  FaChartLine,
  FaTheaterMasks,
  FaCalendarAlt,
  FaSpinner,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaPercentage,
  FaEye,
} from "react-icons/fa";

const StatCard = ({
  icon: Icon,
  title,
  value,
  change,
  darkMode,
  color,
  link,
  subtitle,
}) => {
  const colorClasses = {
    purple: darkMode
      ? "bg-purple-900/20 text-purple-400"
      : "bg-purple-100 text-purple-600",
    blue: darkMode
      ? "bg-blue-900/20 text-blue-400"
      : "bg-blue-100 text-blue-600",
    green: darkMode
      ? "bg-green-900/20 text-green-400"
      : "bg-green-100 text-green-600",
    yellow: darkMode
      ? "bg-yellow-900/20 text-yellow-400"
      : "bg-yellow-100 text-yellow-600",
    red: darkMode ? "bg-red-900/20 text-red-400" : "bg-red-100 text-red-600",
    indigo: darkMode
      ? "bg-indigo-900/20 text-indigo-400"
      : "bg-indigo-100 text-indigo-600",
  };

  const content = (
    <div
      className={`p-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
        darkMode ? "bg-gray-800" : "bg-white"
      } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon size={20} />
            </div>
            {change !== undefined && (
              <div
                className={`flex items-center text-sm font-medium ${
                  change > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {change > 0 ? (
                  <FaArrowUp size={12} />
                ) : (
                  <FaArrowDown size={12} />
                )}
                <span className="ml-1">{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          <h3
            className={`text-sm font-medium ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-2xl font-bold mt-1 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={`text-xs mt-1 ${
                darkMode ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return link ? (
    <Link to={link} className="block">
      {content}
    </Link>
  ) : (
    content
  );
};

const RevenueBreakdown = ({ data, darkMode, t }) => {
  const total = data.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div
      className={`p-6 rounded-xl ${
        darkMode ? "bg-gray-800" : "bg-white"
      } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FaMoneyBillWave className="text-green-500" />
        {t("भुक्तानी विधि विश्लेषण", "Payment Method Analysis")}
      </h3>
      <div className="space-y-4">
        {data.map((method, index) => {
          const percentage = ((method.revenue / total) * 100).toFixed(1);
          return (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {method._id}
                </span>
                <div className="text-right">
                  <span className="font-semibold">
                    NRs. {method.revenue.toLocaleString()}
                  </span>
                  <span
                    className={`text-sm ml-2 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    ({percentage}%)
                  </span>
                </div>
              </div>
              <div
                className={`w-full h-2 rounded-full overflow-hidden ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    method._id === "khalti"
                      ? "bg-purple-500"
                      : method._id === "esewa"
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs">
                <span className={darkMode ? "text-gray-500" : "text-gray-400"}>
                  {method.count} {t("लेनदेनहरू", "transactions")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TopMoviesTable = ({ movies, darkMode, t }) => {
  return (
    <div
      className={`p-6 rounded-xl ${
        darkMode ? "bg-gray-800" : "bg-white"
      } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FaStar className="text-yellow-500" />
        {t("शीर्ष प्रदर्शन चलचित्रहरू", "Top Performing Movies")}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className={`border-b ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <th className="text-left py-2 text-sm font-medium">
                {t("चलचित्र", "Movie")}
              </th>
              <th className="text-right py-2 text-sm font-medium">
                {t("बुकिङ", "Bookings")}
              </th>
              <th className="text-right py-2 text-sm font-medium">
                {t("राजस्व", "Revenue")}
              </th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie, index) => (
              <tr
                key={index}
                className={`border-b ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{index + 1}.</span>
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-700"}
                    >
                      {movie.movieTitle}
                    </span>
                  </div>
                </td>
                <td className="text-right py-3">
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {movie.totalBookings || 0}
                  </span>
                </td>
                <td className="text-right py-3">
                  <span className="font-semibold text-sm">
                    NRs. {movie.totalRevenue.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TheaterPerformance = ({ theaters, darkMode, t }) => {
  return (
    <div
      className={`p-6 rounded-xl ${
        darkMode ? "bg-gray-800" : "bg-white"
      } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FaTheaterMasks className="text-purple-500" />
        {t("थिएटर प्रदर्शन", "Theater Performance")}
      </h3>
      <div className="space-y-3">
        {theaters.map((theater, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              darkMode ? "bg-gray-700/50" : "bg-gray-50"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{theater.theaterName}</h4>
                <div className="flex gap-4 mt-1 text-sm">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {theater.totalBookings} {t("बुकिङ", "bookings")}
                  </span>
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {theater.uniqueMoviesCount} {t("चलचित्र", "movies")}
                  </span>
                </div>
              </div>
              <span className="font-semibold">
                NRs. {theater.totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RecentActivity = ({ bookings, darkMode, t }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return darkMode
          ? "bg-green-900/20 text-green-400"
          : "bg-green-100 text-green-800";
      case "Cancelled":
        return darkMode
          ? "bg-red-900/20 text-red-400"
          : "bg-red-100 text-red-800";
      default:
        return darkMode
          ? "bg-gray-700 text-gray-400"
          : "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      className={`p-6 rounded-xl ${
        darkMode ? "bg-gray-800" : "bg-white"
      } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FaClock className="text-blue-500" />
          {t("हालका गतिविधिहरू", "Recent Activity")}
        </h3>
        <Link
          to="/admin/bookings"
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          {t("सबै हेर्नुहोस्", "View all")} →
        </Link>
      </div>
      <div className="space-y-3">
        {bookings.slice(0, 5).map((booking) => (
          <div
            key={booking._id}
            className={`p-3 rounded-lg ${
              darkMode ? "bg-gray-700/50" : "bg-gray-50"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">
                  {booking.bookingReference}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {booking.user?.username} • {booking.seats?.length} seats
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">
                  NPR {booking.totalPrice}
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function DashboardPage() {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [comprehensiveAnalytics, setComprehensiveAnalytics] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAllData();
  }, [selectedPeriod]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, salesRes, analyticsRes, bookingsRes] = await Promise.all(
        [
          api.get("/admin/stats"),
          api.get(`/admin/sales-report?days=${selectedPeriod}`),
          api.get("/admin/analytics/comprehensive"),
          api.get("/bookings"),
        ]
      );

      setDashboardStats(statsRes.data.data);
      setSalesReport(salesRes.data.data);
      setComprehensiveAnalytics(analyticsRes.data.data);
      setRecentBookings(bookingsRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      showToast(
        t("ड्यासबोर्ड डाटा लोड गर्न असफल भयो", "Failed to load dashboard data"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-purple-600" />
      </div>
    );
  }

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const todayRevenue =
    salesReport?.dailySales?.find(
      (sale) => new Date(sale._id).toDateString() === new Date().toDateString()
    )?.totalRevenue || 0;

  const yesterdayRevenue =
    salesReport?.dailySales?.find((sale) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return new Date(sale._id).toDateString() === yesterday.toDateString();
    })?.totalRevenue || 0;

  const revenueGrowth = calculateGrowth(todayRevenue, yesterdayRevenue);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {t("एडमिन ड्यासबोर्ड", "Admin Dashboard")}
          </h1>
        </div>

        {/* Period Selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setSelectedPeriod(days)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === days
                  ? "bg-purple-600 text-white"
                  : darkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {t(`पछिल्लो ${days} दिन`, `Last ${days} days`)}
            </button>
          ))}
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={FaUsers}
            title={t("कुल प्रयोगकर्ताहरू", "Total Users")}
            value={dashboardStats?.totalUsers || 0}
            change={comprehensiveAnalytics?.userEngagement?.retentionRate}
            darkMode={darkMode}
            color="blue"
            subtitle={`${
              comprehensiveAnalytics?.userEngagement?.activeUsers || 0
            } ${t("सक्रिय", "active")}`}
          />

          <StatCard
            icon={FaFilm}
            title={t("कुल चलचित्रहरू", "Total Movies")}
            value={dashboardStats?.totalMovies || 0}
            darkMode={darkMode}
            color="purple"
            link="/admin/movies"
            subtitle={`${
              comprehensiveAnalytics?.moviePerformance?.totalMoviesShowing || 0
            } ${t("प्रदर्शनमा", "now showing")}`}
          />

          <StatCard
            icon={FaTicketAlt}
            title={t("कुल बुकिङहरू", "Total Bookings")}
            value={dashboardStats?.totalBookings || 0}
            change={15.3}
            darkMode={darkMode}
            color="green"
            link="/admin/bookings"
          />

          <StatCard
            icon={FaMoneyBillWave}
            title={t("कुल राजस्व", "Total Revenue")}
            value={`NRs. ${(
              dashboardStats?.totalRevenue || 0
            ).toLocaleString()}`}
            change={parseFloat(revenueGrowth)}
            darkMode={darkMode}
            color="yellow"
          />
        </div>

        {/* Revenue Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div
              className={`p-6 rounded-xl ${
                darkMode ? "bg-gray-800" : "bg-white"
              } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaChartLine className="text-indigo-500" />
                {t("राजस्व प्रवृत्ति", "Revenue Trends")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 rounded-lg ${
                    darkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {t("आजको राजस्व", "Today's Revenue")}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    NRs. {todayRevenue.toLocaleString()}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-lg ${
                    darkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {t("औसत दैनिक", "Daily Average")}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    NRs.{" "}
                    {Math.round(
                      comprehensiveAnalytics?.revenue?.totalRevenue /
                        selectedPeriod
                    ).toLocaleString()}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-lg ${
                    darkMode ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {t("अवधि कुल", "Period Total")}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    NRs.{" "}
                    {(
                      comprehensiveAnalytics?.revenue?.totalRevenue || 0
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Daily Sales List */}
              <div className="mt-6">
                <h4
                  className={`text-sm font-medium mb-3 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("दैनिक बिक्री", "Daily Sales")}
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {salesReport?.dailySales
                    ?.slice(-7)
                    .reverse()
                    .map((day, index) => (
                      <div
                        key={index}
                        className={`flex justify-between items-center p-2 rounded ${
                          darkMode ? "bg-gray-700/30" : "bg-gray-50"
                        }`}
                      >
                        <span className="text-sm">
                          {new Date(day._id).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <div className="text-right">
                          <span className="font-semibold text-sm">
                            NPR {day.totalRevenue.toLocaleString()}
                          </span>
                          <span
                            className={`text-xs ml-2 ${
                              darkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            ({day.totalBookings} bookings)
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <RevenueBreakdown
              data={comprehensiveAnalytics?.revenue?.paymentMethods || []}
              darkMode={darkMode}
              t={t}
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TopMoviesTable
            movies={salesReport?.topMovies || []}
            darkMode={darkMode}
            t={t}
          />

          <TheaterPerformance
            theaters={
              comprehensiveAnalytics?.theaterUtilization?.theaterPerformance ||
              []
            }
            darkMode={darkMode}
            t={t}
          />
        </div>

        {/* User Engagement & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div
            className={`p-6 rounded-xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaUsers className="text-blue-500" />
              {t("प्रयोगकर्ता संलग्नता", "User Engagement")}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-lg ${
                  darkMode ? "bg-gray-700/50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <FaEye className="text-purple-500" />
                  <span className="text-2xl font-bold">
                    {comprehensiveAnalytics?.userEngagement?.activeUsers || 0}
                  </span>
                </div>
                <p
                  className={`text-sm mt-2 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("सक्रिय प्रयोगकर्ता", "Active Users")}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg ${
                  darkMode ? "bg-gray-700/50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <FaPercentage className="text-green-500" />
                  <span className="text-2xl font-bold">
                    {comprehensiveAnalytics?.userEngagement?.retentionRate?.toFixed(
                      1
                    ) || 0}
                    %
                  </span>
                </div>
                <p
                  className={`text-sm mt-2 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("प्रतिधारण दर", "Retention Rate")}
                </p>
              </div>
            </div>

            {/* Top Spenders */}
            <div className="mt-4">
              <h4
                className={`text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {t("शीर्ष खर्चकर्ता", "Top Spenders")}
              </h4>
              <div className="space-y-2">
                {comprehensiveAnalytics?.userEngagement?.topSpenders
                  ?.slice(0, 3)
                  .map((user, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-2 rounded ${
                        darkMode ? "bg-gray-700/30" : "bg-gray-50"
                      }`}
                    >
                      <span className="text-sm truncate">{user.username}</span>
                      <span className="font-semibold text-sm">
                        NRs. {user.totalSpent.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <RecentActivity bookings={recentBookings} darkMode={darkMode} t={t} />
        </div>

        {/* Quick Actions */}
        <div
          className={`p-6 rounded-xl ${
            darkMode ? "bg-gray-800" : "bg-white"
          } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          <h3 className="text-lg font-semibold mb-4">
            {t("द्रुत कार्यहरू", "Quick Actions")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/movies"
              className={`p-4 rounded-lg text-center transition-colors ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <FaFilm className="mx-auto text-2xl text-purple-500 mb-2" />
              <span className="text-sm font-medium">
                {t("नयाँ चलचित्र थप्नुहोस्", "Add New Movie")}
              </span>
            </Link>

            <Link
              to="/admin/showtimes"
              className={`p-4 rounded-lg text-center transition-colors ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <FaCalendarAlt className="mx-auto text-2xl text-blue-500 mb-2" />
              <span className="text-sm font-medium">
                {t("शो समय व्यवस्थापन", "Manage Showtimes")}
              </span>
            </Link>

            <Link
              to="/admin/theaters"
              className={`p-4 rounded-lg text-center transition-colors ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <FaTheaterMasks className="mx-auto text-2xl text-green-500 mb-2" />
              <span className="text-sm font-medium">
                {t("थिएटर व्यवस्थापन", "Manage Theaters")}
              </span>
            </Link>

            <Link
              to="/admin/bookings"
              className={`p-4 rounded-lg text-center transition-colors ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <FaTicketAlt className="mx-auto text-2xl text-yellow-500 mb-2" />
              <span className="text-sm font-medium">
                {t("बुकिङ हेर्नुहोस्", "View Bookings")}
              </span>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`p-6 rounded-xl text-center ${
              darkMode
                ? "bg-gradient-to-br from-purple-900/20 to-purple-800/20"
                : "bg-gradient-to-br from-purple-100 to-purple-200"
            }`}
          >
            <h4 className="text-lg font-semibold mb-2">
              {t("आजको लक्ष्य", "Today's Target")}
            </h4>
            <p className="text-3xl font-bold">NRs. 25,000</p>
            <div className="mt-2">
              <div
                className={`w-full h-2 rounded-full overflow-hidden ${
                  darkMode ? "bg-gray-700" : "bg-gray-300"
                }`}
              >
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((todayRevenue / 25000) * 100, 100)}%`,
                  }}
                />
              </div>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {((todayRevenue / 25000) * 100).toFixed(1)}%{" "}
                {t("प्राप्त", "achieved")}
              </p>
            </div>
          </div>

          <div
            className={`p-6 rounded-xl text-center ${
              darkMode
                ? "bg-gradient-to-br from-blue-900/20 to-blue-800/20"
                : "bg-gradient-to-br from-blue-100 to-blue-200"
            }`}
          >
            <h4 className="text-lg font-semibold mb-2">
              {t("औसत टिकट मूल्य", "Average Ticket Price")}
            </h4>
            <p className="text-3xl font-bold">
              NRs.{" "}
              {Math.round(
                (comprehensiveAnalytics?.revenue?.totalRevenue || 0) /
                  (comprehensiveAnalytics?.revenue?.totalBookings || 1)
              )}
            </p>
            <p
              className={`text-sm mt-2 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {t("प्रति बुकिङ", "per booking")}
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div
          className={`mt-8 p-4 rounded-lg text-center ${
            darkMode ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("अन्तिम अपडेट", "Last updated")}:{" "}
            {new Date().toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <p
            className={`text-xs mt-1 ${
              darkMode ? "text-gray-500" : "text-gray-500"
            }`}
          >
            {t(
              "डाटा हरेक ५ मिनेटमा रिफ्रेश हुन्छ",
              "Data refreshes every 5 minutes"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
