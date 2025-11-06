import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { FaClock } from "react-icons/fa";

function LockTimer({ lockExpires, onExpired, inline = false }) {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!lockExpires) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expires = new Date(lockExpires).getTime();
      const difference = expires - now;

      if (difference > 0) {
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);

        setIsUrgent(difference < 2 * 60 * 1000);
      } else {
        setTimeLeft("0:00");
        if (onExpired) {
          onExpired();
        }
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lockExpires, onExpired]);

  if (!lockExpires || timeLeft === "0:00") return null;

  if (inline) {
    return (
      <div
        className={`flex items-center space-x-2 ${
          isUrgent ? "animate-pulse" : ""
        }`}
      >
        <FaClock
          className={`${isUrgent ? "text-red-500" : "text-orange-500"}`}
        />
        <span
          className={`text-xl font-bold ${
            isUrgent
              ? "text-red-600 dark:text-red-400"
              : "text-orange-600 dark:text-orange-400"
          }`}
        >
          {timeLeft}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`fixed top-20 right-4 p-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in-right z-50 ${
        isUrgent
          ? darkMode
            ? "bg-red-900 text-white border-2 border-red-500"
            : "bg-red-100 text-red-900 border-2 border-red-500"
          : darkMode
          ? "bg-gray-800 text-white"
          : "bg-white text-gray-900"
      } ${isUrgent ? "animate-pulse" : ""}`}
    >
      <FaClock className="text-purple-500" />
      <div>
        <p className="text-xs font-medium">
          {t("सिट लक समय", "Seat Lock Time")}
        </p>
        <p
          className={`text-lg font-bold ${
            isUrgent ? "text-red-600 dark:text-red-400" : "text-purple-600"
          }`}
        >
          {timeLeft}
        </p>
      </div>
    </div>
  );
}

export default LockTimer;
