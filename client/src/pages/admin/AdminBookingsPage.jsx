import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import { formatDate, formatTime } from "../../services/utils";
import {
  FaTicketAlt,
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaSpinner,
  FaUsers,
  FaFilm,
} from "react-icons/fa";
import CancellationModal from "../../components/common/CancellationModal";

const StatusBadge = ({ status, darkMode }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "Confirmed":
        return darkMode
          ? "bg-green-900/20 text-green-400 border-green-800"
          : "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return darkMode
          ? "bg-red-900/20 text-red-400 border-red-800"
          : "bg-red-100 text-red-800 border-red-200";
      case "Pending":
        return darkMode
          ? "bg-yellow-900/20 text-yellow-400 border-yellow-800"
          : "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Used":
        return darkMode
          ? "bg-gray-700 text-gray-400 border-gray-600"
          : "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return darkMode
          ? "bg-gray-700 text-gray-400 border-gray-600"
          : "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "Confirmed":
        return <FaCheckCircle className="w-3 h-3" />;
      case "Cancelled":
        return <FaTimesCircle className="w-3 h-3" />;
      case "Pending":
        return <FaClock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border ${getStatusStyles()}`}
    >
      {getIcon()}
      {status}
    </span>
  );
};

const PaymentBadge = ({ status, darkMode }) => {
  const getPaymentStyles = () => {
    switch (status) {
      case "Completed":
        return darkMode
          ? "bg-green-900/20 text-green-400"
          : "bg-green-100 text-green-800";
      case "Failed":
        return darkMode
          ? "bg-red-900/20 text-red-400"
          : "bg-red-100 text-red-800";
      case "Refunded":
        return darkMode
          ? "bg-purple-900/20 text-purple-400"
          : "bg-purple-100 text-purple-800";
      default:
        return darkMode
          ? "bg-yellow-900/20 text-yellow-400"
          : "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${getPaymentStyles()}`}
    >
      {status}
    </span>
  );
};

function AdminBookingsPage() {
  const { darkMode } = useTheme();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    cancelled: 0,
    revenue: 0,
    todayBookings: 0,
  });

  useEffect(() => {
    fetchBookings();
    window.scrollTo(0, 0);
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/bookings");
      const bookingsData = response.data.data || [];
      setBookings(bookingsData);
      calculateStats(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      showToast(
        t("बुकिङहरू लोड गर्न असफल", "Failed to load bookings"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsData) => {
    const today = new Date().toDateString();
    const stats = bookingsData.reduce(
      (acc, booking) => {
        acc.total++;
        if (booking.status === "Confirmed") acc.confirmed++;
        if (booking.status === "Cancelled") acc.cancelled++;
        if (booking.paymentStatus === "Completed") {
          acc.revenue += booking.totalPrice;
        }
        if (new Date(booking.createdAt).toDateString() === today) {
          acc.todayBookings++;
        }
        return acc;
      },
      { total: 0, confirmed: 0, cancelled: 0, revenue: 0, todayBookings: 0 }
    );
    setStats(stats);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.bookingReference
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.user?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    const matchesPayment =
      paymentFilter === "all" || booking.paymentStatus === paymentFilter;

    let matchesDate = true;
    if (dateFilter) {
      const bookingDate = new Date(booking.createdAt).toDateString();
      const filterDate = new Date(dateFilter).toDateString();
      matchesDate = bookingDate === filterDate;
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handleOpenCancelModal = (booking) => {
    setBookingToCancel(booking);
    setShowDetails(false);
    setIsCancelModalOpen(false);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;

    const bookingId = bookingToCancel._id;
    setActionLoading((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      showToast("Booking successfully cancelled for user.", "success");
      fetchBookings();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Cancellation failed.",
        "error"
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookingId]: false }));
      setIsCancelModalOpen(false);
      setBookingToCancel(null);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Booking ID",
      "User",
      "Movie",
      "Theater",
      "Showtime",
      "Seats",
      "Amount",
      "Payment Method",
      "Status",
      "Date",
    ];

    const rows = filteredBookings.map((booking) => [
      booking.bookingReference,
      booking.user?.username || "N/A",
      booking.showtime?.movie?.title || "N/A",
      booking.showtime?.theater?.name || "N/A",
      formatTime(booking.showtime?.startTime),
      booking.seats?.join(", ") || "N/A",
      booking.totalPrice,
      booking.paymentMethod,
      booking.status,
      formatDate(booking.createdAt),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast(t("डाटा निर्यात गरियो", "Data exported successfully"), "success");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-purple-600" />
      </div>
    );
  }

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
            {t("बुकिङ व्यवस्थापन", "Booking Management")}
          </h1>
          <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {t(
              "सबै चलचित्र टिकट बुकिङहरू हेर्नुहोस् र व्यवस्थापन गर्नुहोस्",
              "View and manage all movie ticket bookings"
            )}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div
            className={`p-4 rounded-xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("कुल बुकिङ", "Total Bookings")}
                </p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <FaTicketAlt className="text-purple-500 text-2xl" />
            </div>
          </div>

          <div
            className={`p-4 rounded-xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("पुष्टि भएका", "Confirmed")}
                </p>
                <p className="text-2xl font-bold mt-1 text-green-500">
                  {stats.confirmed}
                </p>
              </div>
              <FaCheckCircle className="text-green-500 text-2xl" />
            </div>
          </div>

          <div
            className={`p-4 rounded-xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("रद्द गरिएका", "Cancelled")}
                </p>
                <p className="text-2xl font-bold mt-1 text-red-500">
                  {stats.cancelled}
                </p>
              </div>
              <FaTimesCircle className="text-red-500 text-2xl" />
            </div>
          </div>

          <div
            className={`p-4 rounded-xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("कुल राजस्व", "Total Revenue")}
                </p>
                <p className="text-2xl font-bold mt-1">
                  NPR {stats.revenue.toLocaleString()}
                </p>
              </div>
              <FaMoneyBillWave className="text-yellow-500 text-2xl" />
            </div>
          </div>

          <div
            className={`p-4 rounded-xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("आजका बुकिङ", "Today's Bookings")}
                </p>
                <p className="text-2xl font-bold mt-1">{stats.todayBookings}</p>
              </div>
              <FaCalendarAlt className="text-blue-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className={`p-4 rounded-xl mb-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder={t("खोज्नुहोस्...", "Search...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value="all">{t("सबै स्थिति", "All Status")}</option>
              <option value="Confirmed">{t("पुष्टि भएका", "Confirmed")}</option>
              <option value="Pending">{t("विचाराधीन", "Pending")}</option>
              <option value="Cancelled">{t("रद्द गरिएका", "Cancelled")}</option>
              <option value="Used">{t("प्रयोग भएका", "Used")}</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value="all">{t("सबै भुक्तानी", "All Payments")}</option>
              <option value="Completed">{t("पूर्ण", "Completed")}</option>
              <option value="Pending">{t("विचाराधीन", "Pending")}</option>
              <option value="Failed">{t("असफल", "Failed")}</option>
              <option value="Refunded">{t("फिर्ता", "Refunded")}</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPaymentFilter("all");
                  setDateFilter("");
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                {t("रिसेट", "Reset")}
              </button>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <FaDownload />
                {t("निर्यात", "Export")}
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div
          className={`rounded-xl overflow-hidden ${
            darkMode ? "bg-gray-800" : "bg-white"
          } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t("बुकिङ आईडी", "Booking ID")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t("ग्राहक", "Customer")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t("चलचित्र र शो", "Movie & Show")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t("सिटहरू", "Seats")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t("रकम", "Amount")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t("स्थिति", "Status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t("मिति", "Date")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t("कार्यहरू", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  darkMode ? "divide-gray-700" : "divide-gray-200"
                }`}
              >
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className={`${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium">
                          {booking.bookingReference}
                        </div>
                        <div
                          className={`text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {booking.paymentMethod}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium">
                          {booking.user?.username}
                        </div>
                        <div
                          className={`text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {booking.user?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium">
                          {language === "np"
                            ? booking.showtime?.movie?.titleNepali ||
                              booking.showtime?.movie?.title
                            : booking.showtime?.movie?.title}
                        </div>
                        <div
                          className={`text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {booking.showtime?.theater?.name} •{" "}
                          {formatTime(booking.showtime?.startTime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{booking.seats?.join(", ")}</div>
                      <div
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {booking.seats?.length} {t("सिटहरू", "seats")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        NPR {booking.totalPrice}
                      </div>
                      <PaymentBadge
                        status={booking.paymentStatus}
                        darkMode={darkMode}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge
                        status={booking.status}
                        darkMode={darkMode}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(booking.createdAt, language)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
                      >
                        <FaEye />
                        {t("हेर्नुहोस्", "View")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <FaTicketAlt
                className={`mx-auto h-12 w-12 ${
                  darkMode ? "text-gray-600" : "text-gray-400"
                }`}
              />
              <h3
                className={`mt-2 text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-900"
                }`}
              >
                {t("कुनै बुकिङ फेला परेन", "No bookings found")}
              </h3>
              <p
                className={`mt-1 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {t(
                  "हालका फिल्टरहरूसँग कुनै बुकिङ मेल खाँदैन",
                  "No bookings match the current filters"
                )}
              </p>
            </div>
          )}
        </div>

        {/* Booking Details Modal */}
        {showDetails && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className={`max-w-2xl w-full rounded-xl p-6 max-h-[90vh] overflow-y-auto ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">
                  {t("बुकिङ विवरण", "Booking Details")}
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className={`p-2 rounded-lg ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-400"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Booking Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FaTicketAlt className="text-purple-500" />
                    {t("बुकिङ जानकारी", "Booking Information")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("बुकिङ आईडी", "Booking ID")}
                      </p>
                      <p className="font-medium">
                        {selectedBooking.bookingReference}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("स्थिति", "Status")}
                      </p>
                      <StatusBadge
                        status={selectedBooking.status}
                        darkMode={darkMode}
                      />
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("बुकिङ मिति", "Booking Date")}
                      </p>
                      <p className="font-medium">
                        {formatDate(selectedBooking.createdAt, language)}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("सिटहरू", "Seats")}
                      </p>
                      <p className="font-medium">
                        {selectedBooking.seats?.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FaUsers className="text-blue-500" />
                    {t("ग्राहक जानकारी", "Customer Information")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("नाम", "Name")}
                      </p>
                      <p className="font-medium">
                        {selectedBooking.user?.username}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("इमेल", "Email")}
                      </p>
                      <p className="font-medium">
                        {selectedBooking.user?.email}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("फोन", "Phone")}
                      </p>
                      <p className="font-medium">
                        {selectedBooking.user?.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Movie & Show Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FaFilm className="text-purple-500" />
                    {t("चलचित्र र शो जानकारी", "Movie & Show Information")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("चलचित्र", "Movie")}
                      </p>
                      <p className="font-medium">
                        {language === "np"
                          ? selectedBooking.showtime?.movie?.titleNepali ||
                            selectedBooking.showtime?.movie?.title
                          : selectedBooking.showtime?.movie?.title}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("थिएटर", "Theater")}
                      </p>
                      <p className="font-medium">
                        {selectedBooking.showtime?.theater?.name}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("स्क्रिन", "Screen")}
                      </p>
                      <p className="font-medium">
                        {selectedBooking.showtime?.screen}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("शो समय", "Show Time")}
                      </p>
                      <p className="font-medium">
                        {formatDate(
                          selectedBooking.showtime?.startTime,
                          language
                        )}{" "}
                        • {formatTime(selectedBooking.showtime?.startTime)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-500" />
                    {t("भुक्तानी जानकारी", "Payment Information")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("कुल रकम", "Total Amount")}
                      </p>
                      <p className="font-medium text-lg">
                        NPR {selectedBooking.totalPrice}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("भुक्तानी विधि", "Payment Method")}
                      </p>
                      <p className="font-medium capitalize">
                        {selectedBooking.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("भुक्तानी स्थिति", "Payment Status")}
                      </p>
                      <PaymentBadge
                        status={selectedBooking.paymentStatus}
                        darkMode={darkMode}
                      />
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {t("भुक्तानी आईडी", "Payment ID")}
                      </p>
                      <p className="font-medium text-xs">
                        {selectedBooking.paymentId || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                {selectedBooking.qrCode && (
                  <div className="text-center">
                    <h3 className="font-semibold mb-3">
                      {t("QR कोड", "QR Code")}
                    </h3>
                    <img
                      src={selectedBooking.qrCode}
                      alt="Booking QR Code"
                      className="mx-auto w-32 h-32"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      window.open(
                        `/api/bookings/${selectedBooking._id}/ticket`,
                        "_blank"
                      );
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      darkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    {t("टिकट डाउनलोड", "Download Ticket")}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await api.post(
                          `/bookings/${selectedBooking._id}/resend-email`
                        );
                        showToast(
                          t("इमेल पुन: पठाइयो", "Email resent successfully"),
                          "success"
                        );
                      } catch (error) {
                        showToast(
                          t("इमेल पठाउन असफल", "Failed to resend email"),
                          "error"
                        );
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    {t("इमेल पुन: पठाउनुहोस्", "Resend Email")}
                  </button>
                  {selectedBooking.status === "Confirmed" && (
                    <button
                      onClick={() => handleOpenCancelModal(selectedBooking)}
                      className="px-4 py-2 rounded-lg font-medium transition-colors bg-red-600 hover:bg-red-700 text-white"
                    >
                      {t("Cancel Booking", "Cancel Booking")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Modal */}
        {isCancelModalOpen && bookingToCancel && (
          <CancellationModal
            booking={bookingToCancel}
            onClose={() => setIsCancelModalOpen(false)}
            onConfirm={handleConfirmCancel}
            isLoading={actionLoading[bookingToCancel._id]}
          />
        )}
      </div>
    </div>
  );
}

export default AdminBookingsPage;
