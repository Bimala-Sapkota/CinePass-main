import React, { useState } from "react";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";

function Register({ onClose, onSwitchToSignIn }) {
  const { darkMode } = useTheme();
  const { register } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (formData.password.length < 6) {
      showToast(
        t(
          "पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ।",
          "Password must be at least 6 characters."
        ),
        "error"
      );
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast(t("पासवर्ड मेल खाएन।", "Passwords do not match."), "error");
      setLoading(false);
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    if (avatarFile) data.append("avatar", avatarFile);

    const success = await register(data);
    if (success) {
      onClose();
      // onSwitchToSignIn();
    }
    setLoading(false);
  };
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`w-full max-w-md p-8 rounded-lg shadow-lg ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {t("दर्ता गर्नुहोस्", "Register")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleFormSubmit} className="gap-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col items-center mb-4">
              <img
                src={avatarPreview || "/default-avatar.png"}
                alt="Avatar Preview"
                className="w-24 h-24 object-cover rounded-full mb-2"
              />
              <label
                htmlFor="avatar"
                className="cursor-pointer inline-block px-4 py-2 mt-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-md"
              >
                {t("अवतार छान्नुहोस्", "Choose Avatar")}
              </label>
              <input
                type="file"
                name="avatar"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                tabIndex={-1}
                className="hidden"
              />
              {avatarFile && (
                <p className="mt-1 text-sm text-gray-500">{avatarFile.name}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium mb-2"
              >
                {t("पहिलो नाम", "First Name")}
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder={t(
                  "आफ्नो पहिलो नाम लेख्नुहोस्",
                  "Enter your first name"
                )}
                className={`w-full px-4 py-2 rounded-md border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium mb-2"
              >
                {t("थर", "Last Name")}
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder={t("आफ्नो थर लेख्नुहोस्", "Enter your last name")}
                className={`w-full px-4 py-2 rounded-md border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {t("इमेल", "Email")}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className={`w-full px-4 py-2 rounded-md border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                {t("फोन नम्बर", "Phone Number")}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="+97798XXXXXXXX"
                value={formData.phone}
                onChange={handleInputChange}
                maxLength={16}
                autoComplete="tel"
                className={`w-full px-4 py-2 rounded-md border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                {t("पासवर्ड", "Password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-lg"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                {t("पासवर्ड पुष्टि गर्नुहोस्", "Confirm Password")}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-lg"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="col-span-2 flex items-center">
              <input type="checkbox" id="terms" className="mr-2" required />
              <label htmlFor="terms">
                {t(
                  "म नियम र गोपनीयता नीतिमा सहमत छु",
                  "I agree to the Terms and Privacy Policy"
                )}
              </label>
            </div>

            <div className="col-span-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md cursor-pointer "
              >
                {loading
                  ? t("दर्ता गर्दै...", "Registering...")
                  : t("दर्ता गर्नुहोस्", "Register")}
              </button>
            </div>

            <div className="col-span-2 text-center text-sm">
              {t("पहिले नै खाता छ?", "Already have an account?")}
              <button
                type="button"
                onClick={() => {
                  // onClose();
                  onSwitchToSignIn();
                }}
                className="ml-1 text-red-600 hover:text-red-500 cursor-pointer "
              >
                {t("लगइन", "Login")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
