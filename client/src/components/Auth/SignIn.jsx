import React, { useState } from "react";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router";
import { useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";

function SignIn({ onClose, onSwitchToRegister, redirectPath }) {
  const { darkMode } = useTheme();
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      onClose();
      navigate(redirectPath || "/");
    } catch (err) {
      console.error("Login failed on component level:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`w-full max-w-md p-8 rounded-lg shadow-lg transition-all ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t("लग - इन", "Login")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer "
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              {t("इमेल", "Email")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full px-4 py-2 rounded-md text-sm border focus:outline-none focus:ring-2
               ${
                 darkMode
                   ? "bg-gray-700 border-gray-600 "
                   : "bg-white border-gray-300 "
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-4 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300 "
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

          <div className="flex items-center justify-between text-sm mt-4">
            <label
              htmlFor="remember"
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                id="remember"
                name="remember"
                className="w-4 h-4 accent-red-600"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>{t("मलाई सम्झनुहोस्", "Remember me")}</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-sm text-red-600 hover:text-red-500 transition"
              onClick={onClose}
            >
              {t("पासवर्ड बिर्सनुभयो?", "Forgot password?")}
            </Link>
          </div>

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2  px-4 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition ${
              loading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            } cursor-pointer `}
          >
            {loading ? t("लगइन गर्दै...", "Logging in...") : t("लगइन", "Login")}
          </button>

          <div className="text-center text-sm pt-2">
            {t("खाता छैन?", "Don't have an account?")}
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToRegister();
              }}
              className="ml-1 text-red-600 hover:text-red-500 font-medium cursor-pointer"
            >
              {t("दर्ता गर्नुहोस्", "Register")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
