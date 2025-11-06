import React, { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import {
  FaCheckCircle,
  FaTicketAlt,
  FaQrcode,
  FaDownload,
  FaEnvelope,
  FaHome,
} from "react-icons/fa";
import { getImageUrl } from "./../services/utils";

function BookingSuccessPage() {
  const { bookingid } = useParams();
  const location = useLocation();
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [bookingDetails, setBookingDetails] = useState(
    location.state?.bookingDetails || null
  );
  const [loading, setLoading] = useState(!bookingDetails);
  const [error, setError] = useState("");

  const fetchBookingDetails = useCallback(async () => {
    if (!bookingid) {
      console.error("No booking ID in URL, cannot fetch details.");
      setError(t("अमान्य बुकिंग सन्दर्भ।", "Invalid booking reference."));
      setLoading(false);
      return;
    }

    console.log(`Fetching details for booking ID: ${bookingid}`);
    setLoading(true);
    try {
      const response = await api.get(`/bookings/${bookingid}`);
      if (response.data.success) {
        setBookingDetails(response.data.data);
        setError("");
      } else {
        throw new Error(
          response.data.message || t("बुकिंग फेला परेन।", "Booking not found.")
        );
      }
    } catch (err) {
      console.error("Failed to fetch booking details:", err);
      setError(
        err.response?.data?.message ||
          t("बुकिंग विवरण लोड गर्न सकेन।", "Could not load booking details.")
      );
    } finally {
      setLoading(false);
    }
  }, [bookingid, t]);

  useEffect(() => {
    if (!bookingDetails) {
      fetchBookingDetails();
    }
  }, [fetchBookingDetails, bookingDetails]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p>
            {t(
              "तपाईंको बुकिंग विवरण लोड हुँदैछ...",
              "Loading your booking details..."
            )}
          </p>
        </div>
      </div>
    );
  }
  if (error || !bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className={`w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-xl text-center ${
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
          }`}
        >
          <FaCheckCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            {t("त्रुटि", "Error")}
          </h2>
          <p className="text-sm sm:text-base mb-6">
            {error || t("केहि गलत भयो।", "Something went wrong.")}
          </p>
          <Link
            to="/"
            className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold transition-colors duration-300 shadow-md hover:shadow-lg active:scale-95 ${
              darkMode
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            <FaHome className="mr-2" />{" "}
            {t("गृह पृष्ठमा जानुहोस्", "Go to Homepage")}
          </Link>
        </div>
      </div>
    );
  }

  if (!bookingDetails.showtime || !bookingDetails.showtime.movie) {
    console.error(
      "Booking details missing showtime or movie data:",
      bookingDetails
    );
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p>{t("बुकिंग डाटा अपूर्ण छ।", "Booking data is incomplete.")}</p>
          <Link
            to="/my-tickets"
            className="text-purple-600 hover:underline mt-4 block"
          >
            {t("मेरो टिकटहरू हेर्नुहोस्", "View My Tickets")}
          </Link>
        </div>
      </div>
    );
  }

  const { movie, theater, startTime } = bookingDetails.showtime;

  const handleDownloadTicket = async () => {
    if (!bookingDetails?._id) {
      showToast(
        t("बुकिंग विवरण उपलब्ध छैन।", "Booking details not available."),
        "error"
      );
      return;
    }

    try {
      const response = await api.get(`/bookings/${bookingDetails._id}/ticket`);

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
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download ticket:", err);
      showToast(
        err.response?.data?.message ||
          t("टिकट डाउनलोड गर्न सकेन।", "Could not download ticket."),
        "error"
      );
    }
  };

  const handleEmailTicket = async () => {
    if (!bookingDetails?._id) return;
    try {
      await api.post(`/bookings/${bookingDetails._id}/resend-email`);
      showToast(
        t(
          "टिकट तपाईंको इमेलमा पठाइएको छ।",
          "Ticket has been sent to your email."
        ),
        "success"
      );
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          t("इमेल पठाउन असफल भयो।", "Failed to send email."),
        "error"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <div
        className={`w-full max-w-lg p-5 sm:p-8 rounded-2xl shadow-2xl transform transition-all ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        } animate-slide-up-fade`}
      >
        <div className="text-center mb-6">
          <FaCheckCircle className="text-green-500 text-5xl sm:text-6xl mx-auto mb-3" />
          <h2 className="text-2xl sm:text-3xl font-bold text-green-500">
            {t("बुकिङ पुष्टि भयो!", "Booking Confirmed!")}
          </h2>
          <p
            className={`text-sm mt-1 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t(
              "तपाईंको टिकट बुक भयो। शोको आनन्द लिनुहोस्!",
              "Your tickets are booked. Enjoy the show!"
            )}
          </p>
        </div>

        <div
          className={`p-4 rounded-lg mb-6 ${
            darkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          <div className="flex items-start mb-3">
            <img
              src={getImageUrl(movie.posterImage)}
              alt={t(movie.titleNepali, movie.title)}
              className="w-20 h-28 object-cover rounded-md shadow-md mr-4"
            />
            <div>
              <h3 className="font-semibold text-lg line-clamp-2">
                {t(movie.titleNepali, movie.title)}
              </h3>
              <p
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {new Date(startTime).toLocaleDateString(
                  language === "np" ? "ne-NP" : "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
                <br />
                {new Date(startTime).toLocaleTimeString(
                  language === "np" ? "ne-NP" : "en-US",
                  { hour: "numeric", minute: "2-digit" }
                )}{" "}
                @ {t(theater.nameNepali, theater.name)}
              </p>
            </div>
          </div>
          <div
            className={`text-sm space-y-1 border-t pt-2 ${
              darkMode ? "border-gray-600" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between">
              <span>{t("बुकिंग आईडी:", "Booking ID:")}</span>
              <span className="font-mono font-semibold">
                {bookingDetails.bookingReference}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("सिटहरू:", "Seats:")}</span>
              <span className="font-semibold">
                {bookingDetails.seats.join(", ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("कुल भुक्तानी:", "Total Paid:")}</span>
              <span className="font-semibold">
                {bookingDetails.currency || t("रु.", "NRs.")}{" "}
                {bookingDetails.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {bookingDetails.qrCode && (
          <div className="text-center mb-6">
            <p
              className={`text-sm mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {t(
                "सिनेमामा यो QR कोड स्क्यान गर्नुहोस्:",
                "Scan this QR code at the cinema:"
              )}
            </p>
            <img
              src={bookingDetails.qrCode}
              alt="Booking QR Code"
              className={`w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded-lg border-4 p-1 ${
                darkMode
                  ? "border-gray-700 bg-white"
                  : "border-gray-200 bg-white"
              }`}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleDownloadTicket}
            disabled={!bookingDetails.qrCode}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 border-2 ${
              darkMode
                ? "border-purple-500 text-purple-400 hover:bg-purple-500/20"
                : "border-purple-600 text-purple-600 hover:bg-purple-100"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <FaDownload /> {t("टिकट डाउनलोड गर्नुहोस्", "Download Ticket")}
          </button>
          <button
            onClick={handleEmailTicket}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 border-2 ${
              darkMode
                ? "border-blue-500 text-blue-400 hover:bg-blue-500/20"
                : "border-blue-600 text-blue-600 hover:bg-blue-100"
            }`}
          >
            <FaEnvelope /> {t("टिकट इमेल गर्नुहोस्", "Email Ticket")}
          </button>
        </div>

        <Link
          to="/my-tickets"
          className={`w-full mt-2 inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold transition-colors duration-300 shadow-md hover:shadow-lg active:scale-95 ${
            darkMode
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          <FaTicketAlt className="mr-2" />{" "}
          {t("मेरो टिकटहरू हेर्नुहोस्", "View My Tickets")}
        </Link>
        <Link
          to="/"
          className={`w-full mt-3 inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 ${
            darkMode
              ? "text-gray-300 hover:bg-gray-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {t("गृह पृष्ठमा फर्कनुहोस्", "Back to Home")}
        </Link>
      </div>
    </div>
  );
}

export default BookingSuccessPage;
