import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import api, { bookingAPI } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import {
  FiAlertCircle,
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiDownload,
  FiEye,
  FiMail,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import { Link } from "react-router";
import { formatDate, formatTime, getImageUrl } from "../../services/utils";
import CancellationModal from "../common/CancellationModal";

function MyTickets() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { darkMode } = useTheme();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/bookings/my-bookings");
      if (response.data.success) {
        const validBookings = response.data.data.filter(
          (booking) => booking.showtime
        );
        setBookings(validBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      showToast(
        t("बुकिङहरू लोड गर्न त्रुटि", "Error loading bookings"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();

    return bookings.filter((booking) => {
      if (!booking || !booking.showtime) {
        return false;
      }

      const showtimeDate = new Date(booking.showtime.startTime);

      switch (filter) {
        case "upcoming":
          return showtimeDate > now && booking.status !== "Cancelled";
        case "past":
          return showtimeDate <= now || booking.status === "Used";
        case "cancelled":
          return booking.status === "Cancelled";
        default:
          return true;
      }
    });
  };

  const getStatusColor = (status, showtimeDate) => {
    const now = new Date();
    const showtime = new Date(showtimeDate);

    if (status === "Cancelled")
      return ` ${
        darkMode ? "text-red-400  bg-red-900/30" : " bg-red-100 text-red-600"
      }`;
    if (status === "Used")
      return ` ${
        darkMode ? "text-gray-400  bg-gray-700" : " bg-gray-100 text-gray-600"
      }`;
    if (showtime < now)
      return ` ${
        darkMode ? "text-gray-400  bg-gray-700" : " bg-gray-100 text-gray-600"
      }`;
    return ` ${
      darkMode
        ? "text-green-400  bg-green-900/30"
        : " bg-green-100 text-green-600"
    }`;
  };

  const getStatusText = (status, showtimeDate) => {
    const now = new Date();
    const showtime = new Date(showtimeDate);

    if (status === "Cancelled") return t("रद्द गरिएको", "Cancelled");
    if (status === "Used") return t("प्रयोग गरिएको", "Used");
    if (showtime < now) return t("म्याद सकिएको", "Expired");
    return t("मान्य", "Valid");
  };

  const downloadTicket = async (bookingId) => {
    try {
      setActionLoading((prev) => ({
        ...prev,
        [`download_${bookingId}`]: true,
      }));

      const response = await api.get(`/bookings/${bookingId}/ticket`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to generate ticket.");
      }

      const { htmlContent, filename } = response.data.data;

      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      showToast(
        t("टिकट सफलतापूर्वक डाउनलोड भयो", "Ticket downloaded successfully"),
        "success"
      );
    } catch (error) {
      console.error("Error downloading ticket:", error);
      showToast(
        error.response?.data?.message ||
          t("टिकट डाउनलोड गर्न त्रुटि", "Error downloading ticket"),
        "error"
      );
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`download_${bookingId}`]: false,
      }));
    }
  };

  const emailTicket = async (bookingId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`email_${bookingId}`]: true }));

      const response = await api.post(`/bookings/${bookingId}/resend-email`);
      if (response.data.success) {
        showToast(
          t("टिकट तपाईंको इमेलमा पठाइएको छ", "Ticket sent to your email"),
          "success"
        );
      }
    } catch (error) {
      console.error("Error emailing ticket:", error);
      showToast(
        error.response?.data?.message ||
          t("टिकट पठाउन त्रुटि", "Error sending ticket"),
        "error"
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [`email_${bookingId}`]: false }));
    }
  };

  const filteredBookings = getFilteredBookings();

  const handleOpenCancelModal = (booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;

    const bookingId = bookingToCancel._id;
    setActionLoading((prev) => ({
      ...prev,
      [bookingId]: true,
    }));

    try {
      const response = await bookingAPI.cancelBooking(bookingId);
      if (response.success) {
        showToast(response.message, "success");
        setBookings((prevBookings) =>
          prevBookings.map((b) =>
            b._id === bookingToCancel._id ? response.data : b
          )
        );
        fetchBookings();
      }
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          t("रद्द गर्न असफल भयो।", "Cancellation failed."),
        "error"
      );
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [bookingId]: false,
      }));
      setIsCancelModalOpen(false);
      setBookingToCancel(null);
    }
  };

  const BookingSkeleton = () => (
    <div
      className={`${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow-lg overflow-hidden animate-pulse`}
    >
      <div className="p-6">
        <div className="flex space-x-4">
          <div
            className={`w-16 h-20 ${
              darkMode ? "bg-gray-600" : "bg-gray-300"
            } rounded`}
          ></div>
          <div className="flex-1 space-y-2">
            <div
              className={`h-5 rounded w-3/4 ${
                darkMode ? "bg-gray-600" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`h-4 rounded w-1/2 ${
                darkMode ? "bg-gray-600" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`h-4 rounded w-2/3 ${
                darkMode ? "bg-gray-600" : "bg-gray-300"
              }`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"} py-8`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className={`text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            } mb-2`}
          >
            {t("मेरा टिकटहरू", "My Tickets")}
          </h1>
          <p className={`${darkMode ? "text-gray-300" : "text-gray-600 "}`}>
            {t(
              "तपाईंका चलचित्र टिकट र बुकिङहरू व्यवस्थापन गर्नुहोस्",
              "Manage your movie tickets and bookings"
            )}
          </p>
        </div>

        {/* filter tabs */}
        <div
          className={`flex flex-wrap gap-2 mb-6 rounded-lg p-2 shadow-sm ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {[
            { key: "all", label: t("सबै टिकटहरू", "All Tickets") },
            { key: "upcoming", label: t("आउँदै गरेका", "Upcoming") },
            { key: "past", label: t("विगतका", "Past") },
            { key: "cancelled", label: t("रद्द गरिएका", "Cancelled") },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                filter === tab.key
                  ? "bg-red-600 text-white shadow-md"
                  : `${
                      darkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <BookingSkeleton key={index} />
            ))}
          </div>
        )}

        {!loading && filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <FiCalendar
              className={`w-16 h-16 mx-auto mb-4 ${
                darkMode ? "text-gray-600" : "text-gray-300"
              }`}
            />
            <h3
              className={`text-xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              } mb-2`}
            >
              {filter === "all"
                ? t("अहिलेसम्म कुनै बुकिङ छैन", "No bookings yet")
                : t("कुनै टिकट फेला परेन", "No tickets found")}
            </h3>
            <p
              className={` ${
                darkMode ? "text-gray-300" : "text-gray-600"
              } mb-6`}
            >
              {filter === "all"
                ? t(
                    "सुरु गर्न तपाईंको पहिलो चलचित्र टिकट बुक गर्नुहोस्",
                    "Book your first movie ticket to get started"
                  )
                : t(
                    "थप टिकटहरू हेर्न फिल्टर परिवर्तन गर्ने प्रयास गर्नुहोस्",
                    "Try changing the filter to see more tickets"
                  )}
            </p>
            {filter === "all" && (
              <Link
                to="/movies"
                className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                {t("चलचित्रहरू ब्राउज गर्नुहोस्", "Browse Movies")}
              </Link>
            )}
          </div>
        )}

        {/* Bookings */}
        {!loading && filteredBookings.length > 0 && (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className={`${
                  darkMode ? "bg-gray-800" : "bg-white"
                } rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300`}
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Movie Poster */}
                    <div className="shrink-0">
                      <img
                        src={getImageUrl(booking.showtime.movie.posterImage)}
                        alt={booking.showtime.movie.title}
                        className="w-16 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "/default-poster.jpg";
                        }}
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                        <div>
                          <h3
                            className={`text-lg font-bold  ${
                              darkMode ? "text-white" : "text-gray-900"
                            } mb-1`}
                          >
                            {booking.showtime.movie.title}
                          </h3>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-300" : "text-gray-600"
                            } mb-2`}
                          >
                            {booking.showtime.theater.name}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              booking.status,
                              booking.showtime.startTime
                            )}`}
                          >
                            {getStatusText(
                              booking.status,
                              booking.showtime.startTime
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div
                          className={`flex items-center ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          <FiCalendar className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {formatDate(booking.showtime.startTime)}
                          </span>
                        </div>

                        <div
                          className={`flex items-center ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          <FiClock className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {formatTime(booking.showtime.startTime)}
                          </span>
                        </div>

                        <div
                          className={`flex items-center ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          <FiUsers className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {booking.seats.length} {t("सिटहरू", "seats")}
                          </span>
                        </div>

                        <div
                          className={`flex items-center ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          <FiCreditCard className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {t("रु", "NRs.")} {booking.totalPrice}
                          </span>
                        </div>
                      </div>

                      {/* seats */}
                      <div className="mb-4">
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          } mb-1`}
                        >
                          {t("सिटहरू", "Seats")}:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {booking.seats.map((seat, index) => (
                            <span
                              key={index}
                              className={`inline-block  ${
                                darkMode
                                  ? "bg-red-900/30 text-red-300"
                                  : "bg-red-100 text-red-800"
                              }   text-xs px-2 py-1 rounded`}
                            >
                              {seat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* booking reference */}
                      <div className="mb-4">
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          } mb-1`}
                        >
                          {t("बुकिङ सन्दर्भ", "Booking Reference")}:
                          <span
                            className={`font-mono font-medium ml-1 ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {booking.bookingReference}
                          </span>
                        </p>
                      </div>

                      {/* buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className={`flex items-center ${
                            darkMode
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }  px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200`}
                        >
                          <FiEye className="w-4 h-4 mr-1" />
                          {t("विवरण हेर्नुहोस्", "View Details")}
                        </button>

                        <button
                          onClick={() => downloadTicket(booking._id)}
                          disabled={actionLoading[`download_${booking._id}`]}
                          className={`flex items-center ${
                            darkMode
                              ? "bg-red-900/30 hover:bg-red-900/50 text-red-300"
                              : "bg-red-100 hover:bg-red-200 text-red-700"
                          }  px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <FiDownload className="w-4 h-4 mr-1" />
                          {actionLoading[`download_${booking._id}`]
                            ? t("डाउनलोड गर्दै...", "Downloading...")
                            : t("डाउनलोड", "Download")}
                        </button>

                        <button
                          onClick={() => emailTicket(booking._id)}
                          disabled={actionLoading[`email_${booking._id}`]}
                          className={`flex items-center ${
                            darkMode
                              ? "bg-blue-900/30 hover:bg-blue-900/50 text-blue-300"
                              : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                          }  px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <FiMail className="w-4 h-4 mr-1" />
                          {actionLoading[`email_${booking._id}`]
                            ? t("पठाउँदै...", "Sending...")
                            : t("इमेल", "Email")}
                        </button>
                      </div>
                      {new Date(booking.showtime.startTime) > new Date() &&
                        booking.status === "Confirmed" && (
                          <button
                            onClick={() => handleOpenCancelModal(booking)}
                            disabled={actionLoading[booking._id]}
                            className={`flex items-center gap-1.5 px-3 py-2 mt-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                              darkMode
                                ? "bg-red-900/30 text-red-300 hover:bg-red-900/50"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                          >
                            <FiXCircle className="w-4 h-4 mr-1" />
                            {actionLoading[booking._id]
                              ? t("Cancelling...", "Cancelling...")
                              : t("Cancel", "Cancel")}
                          </button>
                        )}
                    </div>

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
              </div>
            ))}
          </div>
        )}

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto`}
            >
              <div className={`p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`text-lg font-bold  ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {t("बुकिङ विवरण", "Booking Details")}
                  </h3>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className={`text-gray-400  ${
                      darkMode ? "hover:text-gray-300" : "hover:text-gray-600"
                    } text-xl font-bold`}
                  >
                    ✕
                  </button>
                </div>

                {/* QR code */}
                {selectedBooking.qrCode && (
                  <div className="text-center mb-6">
                    <img
                      src={selectedBooking.qrCode}
                      alt="Booking QR Code"
                      className={`w-32 h-32 mx-auto border  ${
                        darkMode ? "border-gray-600" : "border-gray-200"
                      } rounded`}
                    />
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500 "
                      } mt-2`}
                    >
                      {t(
                        "यो QR कोड सिनेमा हलमा देखाउनुहोस्",
                        "Show this QR code at the theater"
                      )}
                    </p>
                  </div>
                )}

                {/* Detail info */}
                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {t("चलचित्र", "Movie")}
                    </label>
                    <p
                      className={`${
                        darkMode ? "text-white" : "text-gray-900"
                      } font-medium`}
                    >
                      {selectedBooking.showtime.movie.title}
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {t("सिनेमा हल", "Theater")}
                    </label>
                    <p
                      className={`${
                        darkMode ? "text-white" : "text-gray-900"
                      } font-medium`}
                    >
                      {selectedBooking.showtime.theater.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium  mb-1 ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {t("मिति", "Date")}
                      </label>
                      <p
                        className={`${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatDate(selectedBooking.showtime.startTime)}
                      </p>
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium  mb-1 ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {t("समय", "Time")}
                      </label>
                      <p
                        className={`${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatTime(selectedBooking.showtime.startTime)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium  mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {t("स्क्रिन", "Screen")}
                    </label>
                    <p
                      className={`${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {selectedBooking.showtime.screen}
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium  mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {t("सिटहरू", "Seats")}
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {selectedBooking.seats.map((seat, index) => (
                        <span
                          key={index}
                          className={`inline-block ${
                            darkMode
                              ? "bg-red-900/30 text-red-300 "
                              : "bg-red-100 text-red-800"
                          } text-sm px-2 py-1 rounded`}
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium  mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {t("भुक्तानी विधि", "Payment Method")}
                    </label>
                    <p
                      className={`${
                        darkMode ? "text-white" : "text-gray-900"
                      } capitalize`}
                    >
                      {selectedBooking.paymentMethod}
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium  mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {t("कुल रकम", "Total Amount")}
                    </label>
                    <p
                      className={`${
                        darkMode ? "text-white" : "text-gray-900"
                      } font-semibold`}
                    >
                      NPR {selectedBooking.totalPrice}
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium  mb-1 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {t("स्थिति", "Status")}
                    </label>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedBooking.status,
                        selectedBooking.showtime.startTime
                      )}`}
                    >
                      {getStatusText(
                        selectedBooking.status,
                        selectedBooking.showtime.startTime
                      )}
                    </span>
                  </div>

                  {/* Payment ID if available */}
                  {selectedBooking.paymentId && (
                    <div>
                      <label
                        className={`block text-sm font-medium  mb-1 ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {t("भुक्तानी ID", "Payment ID")}
                      </label>
                      <p
                        className={`${
                          darkMode ? "text-white" : "text-gray-900"
                        } font-mono text-sm`}
                      >
                        {selectedBooking.paymentId}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action buttons in modal */}
                <div className="flex flex-wrap gap-2 mt-6">
                  <button
                    onClick={() => downloadTicket(selectedBooking._id)}
                    disabled={actionLoading[`download_${selectedBooking._id}`]}
                    className={`flex items-center ${
                      darkMode
                        ? "bg-red-900/30 hover:bg-red-900/50 text-red-300"
                        : "bg-red-100 hover:bg-red-200 text-red-700"
                    }  px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <FiDownload className="w-4 h-4 mr-1" />
                    {actionLoading[`download_${selectedBooking._id}`]
                      ? t("डाउनलोड गर्दै...", "Downloading...")
                      : t("डाउनलोड", "Download")}
                  </button>

                  <button
                    onClick={() => emailTicket(selectedBooking._id)}
                    disabled={actionLoading[`email_${selectedBooking._id}`]}
                    className={`flex items-center ${
                      darkMode
                        ? "bg-blue-900/30 hover:bg-blue-900/50 text-blue-300"
                        : "bg-blue-100 hover:bg-blue                        -200 text-blue-700"
                    }  px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <FiMail className="w-4 h-4 mr-1" />
                    {actionLoading[`email_${selectedBooking._id}`]
                      ? t("पठाउँदै...", "Sending...")
                      : t("इमेल", "Email")}
                  </button>
                </div>

                {/* Note */}
                <div
                  className={`mt-6 p-4 border rounded-lg ${
                    darkMode
                      ? "bg-yellow-900/20 border-yellow-800"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-start">
                    <FiAlertCircle
                      className={`w-5 h-5 ${
                        darkMode ? "text-yellow-400" : "text-yellow-600"
                      } mt-0.5 mr-2 shrink-0`}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium mb-1 ${
                          darkMode ? "text-yellow-200" : "text-yellow-800"
                        }`}
                      >
                        {t("महत्वपूर्ण", "Important")}
                      </p>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-yellow-300" : "text-yellow-700"
                        }`}
                      >
                        {t(
                          "कृपया शो समयभन्दा १५ मिनेट अगाडि सिनेमा हलमा पुग्नुहोस्। प्रवेशका लागि यो QR कोड वा बुकिङ सन्दर्भ प्रस्तुत गर्नुहोस्।",
                          "Please arrive at the theater 15 minutes before the show time. Present this QR code or booking reference for entry."
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTickets;
