import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";

const ResetPasswordPage = () => {
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      showToast(
        t(
          "पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ।",
          "Password must be at least 6 characters."
        ),
        "error"
      );
      return;
    }
    if (password !== confirmPassword) {
      showToast(
        t("पासवर्डहरू मेल खाँदैनन्।", "Passwords do not match."),
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/auth/resetpassword/${token}`, {
        password,
      });

      if (response.data.success) {
        setSuccess(true);
        showToast(
          t(
            "पासवर्ड सफलतापूर्वक रिसेट गरिएको छ!",
            "Password has been reset successfully!"
          ),
          "success"
        );
        const newToken = response.data.token;
        localStorage.setItem("token", newToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (error) {
      showToast(
        error.response?.data?.error ||
          t("अमान्य वा म्याद सकिएको टोकन।", "Invalid or expired token."),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
            {t(
              "पासवर्ड सफलतापूर्वक रिसेट भयो!",
              "Password Reset Successfully!"
            )}
          </h2>
          <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {t(
              "तपाईंलाई लग इन गरिएको छ। गृहपृष्ठमा रिडिरेक्ट गर्दै...",
              "You have been logged in. Redirecting to the homepage..."
            )}{" "}
          </p>
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
            {t("आफ्नो पासवर्ड रिसेट गर्नुहोस्", "Reset Your Password")}
          </h2>
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t(
              "तल आफ्नो नयाँ पासवर्ड प्रविष्ट गर्नुहोस्।",
              "Enter your new password below."
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
            >
              {t("नयाँ पासवर्ड", "New Password")}
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full pl-12 pr-12 py-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2"
            >
              {t("नयाँ पासवर्ड पुष्टि गर्नुहोस्", "Confirm New Password")}
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? <FaSpinner className="animate-spin" /> : <FaLock />}
            {loading
              ? t("रिसेट गर्दै...", "Resetting...")
              : t("पासवर्ड रिसेट गर्नुहोस्", "Reset Password")}{" "}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
