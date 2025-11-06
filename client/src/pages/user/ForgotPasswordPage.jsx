import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  FaArrowLeft,
  FaEnvelope,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";

const ForgotPasswordPage = () => {
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgotpassword", { email });
      setEmailSent(true);
      showToast(
        t(
          "पासवर्ड रिसेट इमेल सफलतापूर्वक पठाइयो!",
          "Password reset email sent successfully!"
        ),
        "success"
      );
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        t("रिसेट इमेल पठाउन असफल भयो", "Failed to send reset email");
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div
          className={`max-w-md w-full p-8 rounded-2xl shadow-xl text-center ${
            darkMode ? "bg-gray-800" : "bg-white"
          } animate-fade-in`}
        >
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-5 animate-in-out" />
          <h2 className="text-2xl font-bold mb-2">
            {t("इमेल पठाइयो!", "Email Sent!")}{" "}
          </h2>
          <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {t(
              "हामीले पासवर्ड रिसेट लिङ्क पठाएका छौं",
              "We've sent a password reset link to"
            )}{" "}
            <strong>{email}</strong>.{" "}
            {t(
              "कृपया आफ्नो इनबक्स जाँच गर्नुहोस्।",
              "Please check your inbox."
            )}
          </p>
          <Link
            to="/"
            className="w-full inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-transform transform hover:scale-105"
          >
            {t("गृहपृष्ठमा फर्कनुहोस्", "Back to Home")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div
        className={`max-w-md w-full p-8 rounded-2xl shadow-xl ${
          darkMode ? "bg-gray-800" : "bg-white"
        } animate-fade-in`}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {t("पासवर्ड बिर्सनुभयो?", "Forgot Password?")}
          </h2>
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t(
              "चिन्ता नगर्नुहोस्! हामी तपाईंलाई रिसेट निर्देशनहरू पठाउनेछौं।",
              "No worries! We'll send you reset instructions."
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-2`}>
              {t("इमेल ठेगाना", "Email Address")}{" "}
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full pl-12 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaEnvelope />}
            {loading
              ? t("पठाउँदै...", "Sending...")
              : t("रिसेट लिङ्क पठाउनुहोस्", "Send Reset Link")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
            className="inline-flex items-center gap-2 text-sm hover:underline"
          >
            <FaArrowLeft /> {t("पछाडि जानुहोस्", "Go Back")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
