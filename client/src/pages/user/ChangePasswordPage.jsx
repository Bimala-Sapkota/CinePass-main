import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaArrowLeft,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";

const ChangePasswordPage = () => {
  const { darkMode } = useTheme();
  const { updatePassword } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShowPassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (newPassword.length < 6) {
      showToast(
        t(
          "पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ।",
          "Password must be at least 6 characters."
        ),
        "error"
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(
        t("नयाँ पासवर्डहरू मेल खाँदैनन्।", "New passwords do not match."),
        "error"
      );
      return;
    }
    if (currentPassword === newPassword) {
      showToast(
        t(
          "नयाँ पासवर्ड हालको पासवर्ड जस्तै हुन सक्दैन।",
          "New password cannot be the same as the current password."
        ),
        "error"
      );
      return;
    }

    setLoading(true);
    const success = await updatePassword({ currentPassword, newPassword });
    setLoading(false);

    if (success) {
      navigate(-1);
    }
  };

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
            {t("पासवर्ड परिवर्तन गर्नुहोस्", "Change Password")}
          </h2>
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t(
              "आफ्नो खाताको सुरक्षा अपडेट गर्नुहोस्।",
              "Update your account security."
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium mb-2"
            >
              {t("हालको पासवर्ड", "Current Password")}
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPasswords.current ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
                className={`w-full pl-12 pr-12 py-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword("current")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium mb-2"
            >
              {t("नयाँ पासवर्ड", "New Password")}
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPasswords.new ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                className={`w-full pl-12 pr-12 py-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword("new")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
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
                type={showPasswords.confirm ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className={`w-full pl-12 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword("confirm")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaLock />}
            {loading
              ? t("अपडेट गर्दै...", "Updating...")
              : t("पासवर्ड अपडेट गर्नुहोस्", "Update Password")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm hover:underline"
          >
            <FaArrowLeft /> {t("पछाडि जानुहोस्", "Go Back")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
