import React from "react";
import { useTheme } from "../context/ThemeContext";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { Link, useNavigate } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { useState } from "react";
import { useEffect } from "react";
import PWAInstallPrompt from "../components/common/PWAInstallPrompt";

function Footer() {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsAppInstalled(false);
      localStorage.removeItem("cinepass-app-installed");
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsAppInstalled(true);
      localStorage.setItem("cinepass-app-installed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        showToast(
          t("एप सफलतापूर्वक इन्स्टल भयो!", "App installed successfully!"),
          "success"
        );
      }
      setDeferredPrompt(null);
    }
  };
  const handleOpenClick = () => {
    navigate("/");
  };
  return (
    <footer
      className={`py-12 ${
        darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"
      } transition-colors duration-300`}
    >
      <div className="container mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CinePass</h3>
            <p
              className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              {t(
                "तपाईंको चलचित्र टिकट बुकिङको लागि प्रिमियम गन्तव्य।",
                "Your premier destination for booking movie tickets with best cinematic experience."
              )}
            </p>

            <div className="flex gap-4">
              {[
                ["facebook", FaFacebook],
                ["twitter", FaTwitter],
                ["instagram", FaInstagram],
                ["youtube", FaYoutube],
              ].map(([path, Icon]) => (
                <Link
                  key={path}
                  to={`/${path}`}
                  className={`${
                    darkMode
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  } transition-colors duration-300 cursor-pointer`}
                >
                  <Icon />
                </Link>
              ))}
            </div>
          </div>
          {/* quick links */}
          <nav>
            <h3 className="text-lg font-semibold mb-4">
              {t("छिटो पहुँच", "Quick Links")}
            </h3>
            <ul
              className={`space-y-2 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <li>
                <Link to={"/movies"} className="hover:underline cursor-pointer">
                  {t("चलचित्रहरू", "Movies")}
                </Link>
              </li>
              <li>
                <Link
                  to={"/theaters"}
                  className="hover:underline cursor-pointer"
                >
                  {t("सिनेमाघरहरू", "Theaters")}
                </Link>
              </li>
              <li>
                <Link to={"/offers"} className="hover:underline cursor-pointer">
                  {t("अफर र प्रमोशनहरू", "Offers & Promotions")}
                </Link>
              </li>
              {/* <li>
                <Link
                  to={"/gift-cards"}
                  className="hover:underline cursor-pointer"
                >
                  {t("उपहार कार्डहरू", "Gift Cards")}
                </Link>
              </li> */}
              {/* <li>
                <Link
                  to={"/pwa-app"}
                  className="hover:underline cursor-pointer"
                >
                  {t("मोबाइल एप", "Mobile App")}
                </Link>
              </li> */}
            </ul>
          </nav>
          {/* support */}
          <nav>
            <h3 className="text-lg font-semibold mb-4">
              {t("सहयोग", "Support")}
            </h3>
            <ul
              className={`space-y-2 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <li>
                <Link
                  to={"/help-center"}
                  className="hover:underline cursor-pointer"
                >
                  {t("मद्दत केन्द्र", "Help Center")}
                </Link>
              </li>
              <li>
                <Link
                  to={"/contact-us"}
                  className="hover:underline cursor-pointer"
                >
                  {t("सम्पर्क गर्नुहोस्", "Contact Us")}
                </Link>
              </li>
              <li>
                <Link to={"/faq"} className="hover:underline cursor-pointer">
                  {t("प्रायः सोधिने प्रश्नहरू", "FAQs")}
                </Link>
              </li>
              <li>
                <Link
                  to={"/terms-conditions"}
                  className="hover:underline cursor-pointer"
                >
                  {t("सेवा सर्तहरू", "Terms of Service")}
                </Link>
              </li>
              <li>
                <Link
                  to={"/privacy-policy"}
                  className="hover:underline cursor-pointer"
                >
                  {t("गोपनीयता नीति", "Privacy Policy")}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("हाम्रो PWA एप डाउनलोड गर्नुहोस्", "Download Our PWA App")}
            </h3>
            <p
              className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              {t(
                "तपाईंको मोबाइल उपकरणमा उत्कृष्ट चलचित्र बुकिङ अनुभव प्राप्त गर्नुहोस्।",
                "Get the best movie booking experience on your mobile device."
              )}
            </p>
            <PWAInstallPrompt
              deferredPrompt={deferredPrompt}
              isAppInstalled={isAppInstalled}
              onInstallClick={handleInstallClick}
              onOpenClick={handleOpenClick}
            />

            {/* {deferredPrompt && !isAppInstalled && (
              <>
                <button
                  onClick={handleInstallClick}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-md ${
                    darkMode
                      ? "bg-blue-500 hover:bg-blue-600 text-white hover:shadow-lg"
                      : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
                  }`}
                >
                  📲 {t("एप इन्स्टल गर्नुहोस्", "Install App")}
                </button>
                <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                  {t(
                    "यो एपलिकेसन तपाईंको डिभाइसमा इन्स्टल गर्न सकिन्छ",
                    "This app can be installed on your device"
                  )}
                </p>
              </>
            )} */}
          </div>
        </div>

        <div
          className={`mt-12 pt-8 border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex flex-col-reverse md:flex-row justify-between items-center">
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              } mb-4 md:mb-0`}
            >
              &copy; {new Date().getFullYear()} CinePass.{" "}
              {t("सबै अधिकार सुरक्षित छन्।", "All rights reserved.")}
            </p>
            <div className="flex items-center gap-4">
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {t("भुक्तानी साझेदारहरू:", "Payment Partners:")}
              </span>

              <div className="flex items-center gap-4">
                <a
                  href="https://esewa.com.np"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://kachuwa.com/images/esewa/esewa.png"
                    alt="eSewa Logo"
                    className="h-7 object-contain"
                  />
                </a>
                <a
                  href="https://khalti.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://khaltibyime.khalti.com/wp-content/uploads/2025/07/cropped-Logo-for-Blog-1024x522.png"
                    alt="Khalti Logo"
                    className="h-9 object-contain"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
