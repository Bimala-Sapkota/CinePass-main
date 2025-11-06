import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { FiBell, FiCheck, FiFilm, FiX } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

function NotificationDropdown({
  isOpen,
  notifications,
  isLoading,
  onNotificationClick,
  onMarkAllRead,
  onClose,
}) {
  const { t } = useLanguage();
  const { darkMode } = useTheme();
  if (!isOpen) return null;

  const getNotificationIcon = (type, icon) => {
    switch (type) {
      case "booking":
        return <FiCheck className="w-5 h-5 text-green-500" />;
      case "movie_release":
        return <FiFilm className="w-5 h-5 text-blue-500" />;
      case "offer":
        return <FiBell className="w-5 h-5 text-purple-500" />;

      default:
        return <FiBell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return darkMode ? "bg-gray-800" : "bg-gray-50";

    switch (type) {
      case "booking":
        return `${
          darkMode ? "bg-green-900/20" : "bg-green-50"
        } border-l-4 border-green-500`;
      case "movie_release":
        return `${
          darkMode ? "bg-blue-900/20" : "bg-blue-50"
        } border-l-4 border-blue-500`;
      case "offer":
        return `${
          darkMode ? "bg-purple-900/20" : "bg-purple-50"
        } border-l-4 border-purple-500`;

      default:
        return darkMode ? "bg-gray-700" : "bg-white";
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t("अहिले भर्खर", "Just now");
    if (diffMins < 60) return t(`${diffMins} मिनेट पहिले`, `${diffMins}m ago`);
    if (diffHours < 24)
      return t(`${diffHours} घण्टा पहिले`, `${diffHours}h ago`);
    return t(`${diffDays} दिन पहिले`, `${diffDays}d ago`);
  };
  return (
    <div
      className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-xl border py-2 animate-dropdown-in z-50 max-h-96 overflow-hidden ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <h3
          className={`text-lg font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {t("सूचनाहरू", "Notifications")}
        </h3>
        <div className="flex items-center space-x-2">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={onMarkAllRead}
              className={`text-xs  ${
                darkMode
                  ? "hover:text-red-300 text-red-400"
                  : "hover:text-red-700 text-red-600"
              } font-medium transition-colors duration-200`}
            >
              {t("सबैलाई पढियो भनी चिन्ह लगाउनुहोस्", "Mark all as read")}
            </button>
          )}

          <button
            onClick={onClose}
            className={`p-1  ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            } rounded transition-colors duration-200`}
          >
            <FiX className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
      {isLoading && (
        <div className="px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            } mt-2`}
          >
            {t("Loading notifications...", "Loading notifications...")}
          </p>
        </div>
      )}

      {!isLoading && (
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <FiBell
                className={`w-12 h-12 ${
                  darkMode ? "text-gray-600" : "text-gray-300 "
                } mx-auto mb-3`}
              />
              <p
                className={`text-sm  ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {t("No notifications yet", "No notifications yet")}
              </p>
            </div>
          ) : (
            <div
              className={`divide-y ${
                darkMode ? "divide-gray-700" : "divide-gray-200"
              }`}
            >
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => onNotificationClick(notification)}
                  className={`px-4 py-3 cursor-pointer  ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  } transition-colors duration-200 ${getNotificationColor(
                    notification.type,
                    notification.isRead
                  )}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(
                        notification.type,
                        notification.icon
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium ${
                            notification.isRead
                              ? darkMode
                                ? "text-gray-400"
                                : "text-gray-600"
                              : darkMode
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 ml-2"></div>
                        )}
                      </div>
                      <p
                        className={`text-sm mt-1 ${
                          notification.isRead
                            ? darkMode
                              ? "text-gray-500"
                              : "text-gray-500"
                            : darkMode
                            ? "text-gray-300"
                            : "text-gray-700"
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-gray-500" : "text-gray-400"
                        } mt-1`}
                      >
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {notifications.length > 0 && (
        <div
          className={`px-4 py-3 border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={() => {
              onClose();
              //Navigate to notification page
            }}
            className={`w-full text-center text-sm font-medium transition-colors duration-200 ${
              darkMode
                ? "text-red-400 hover:text-red-300"
                : "text-red-600 hover:text-red-700"
            }`}
          >
            {t("सबै सूचनाहरू हेर्नुहोस्", "View all notifications")}
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
