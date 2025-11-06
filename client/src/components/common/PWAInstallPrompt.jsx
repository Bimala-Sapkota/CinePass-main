import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { FiShare, FiPlusSquare } from "react-icons/fi";

function PWAInstallPrompt({
  deferredPrompt,
  isAppInstalled,
  onInstallClick,
  onOpenClick,
}) {
  const { t } = useLanguage();
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);
  }, []);

  if (isAppInstalled) {
    return (
      <>
        <button
          onClick={onOpenClick} 
          className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-md bg-green-600 hover:bg-green-700 text-white hover:shadow-lg flex items-center gap-2"
        >
          <FaRocket /> {t("एप खोल्नुहोस्", "Open App")}
        </button>
        <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
          {t("एप पहिले नै इन्स्टल गरिएको छ।", "The app is already installed.")}
        </p>
      </>
    );
  }

  if (deferredPrompt) {
    return (
      <>
        <button
          onClick={onInstallClick}
          className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-md bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg"
        >
          📲 {t("एप इन्स्टल गर्नुहोस्", "Install App")}
        </button>
        <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">
          {t(
            "यो एप तपाईंको डिभाइसमा इन्स्टल गर्न सकिन्छ।",
            "This app can be installed on your device."
          )}
        </p>
      </>
    );
  }

  if (isIOS) {
    return (
      <div className="text-left text-xs p-3 bg-gray-200 dark:bg-gray-700 rounded-lg">
        <p className="font-semibold mb-1">
          {t("एप इन्स्टल गर्न:", "To install the app:")}
        </p>
        <p>
          1. {t("ट्याप गर्नुहोस्", "Tap the")}{" "}
          <FiShare className="inline-block mx-1" />{" "}
          {t("Share icon.", "Share icon.")}
        </p>
        <p>
          2.{" "}
          {t(
            "स्क्रोल गर्नुहोस् र 'होम स्क्रिनमा थप्नुहोस्' ट्याप गर्नुहोस्।",
            "Scroll down and tap 'Add to Home Screen'."
          )}{" "}
          <FiPlusSquare className="inline-block ml-1" />
        </p>
      </div>
    );
  }

  return null;
}

export default PWAInstallPrompt;
