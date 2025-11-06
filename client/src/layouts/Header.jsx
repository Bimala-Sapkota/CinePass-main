import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { Link, NavLink, useNavigate } from "react-router";
import api from "../services/api";
import SearchBar from "../components/common/SearchBar";
import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSearch,
  FiSettings,
  FiSun,
  FiUser,
  FiX,
} from "react-icons/fi";
import LanguageToggle from "../components/common/LanguageToggle";
import NotificationDropdown from "./NotificationDropdown";
import { FaTicket } from "react-icons/fa6";
import {
  FaFilm,
  FaHome,
  FaPercent,
  FaTheaterMasks,
  FaTicketAlt,
} from "react-icons/fa";
import { getUserAvatarUrl } from "../services/utils";

const NavigationItems = memo(
  ({ to, icon: Icon, label, t, darkMode, style }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative group flex items-center gap-2 font-medium transition-colors duration-300 py-2 ${
          isActive
            ? darkMode
              ? "text-purple-400 font-semibold"
              : "text-purple-600 font-semibold"
            : darkMode
            ? "text-gray-300 hover:text-purple-400"
            : "text-gray-700 hover:text-purple-600"
        }`
      }
      style={style}
    >
      {({ isActive }) => (
        <div className="--animate-slide-in-nav flex items-center gap-2">
          <Icon />
          <span>{t(...label)}</span>
          <span
            className={`absolute -bottom-1 left-0 h-0.5 bg-purple-500 transition-all duration-300 ease-out ${
              isActive ? "w-full" : "w-0 group-hover:w-full"
            }`}
          />
        </div>
      )}
    </NavLink>
  )
);

function Header({ openRegisterModal, openSignInModal }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        isUserMenuOpen
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        isNotificationOpen
      ) {
        setIsNotificationOpen(false);
      }
    };
    if (isUserMenuOpen || isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen, isNotificationOpen]);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setIsLoadingNotifications(true);
      const response = await api.get("/notifications?limit=10");
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setUnreadCount(0);
      setNotifications([]);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const markNotificationsAsRead = async (notificationIds) => {
    try {
      const response = await api.patch("/notifications/read", {
        notificationIds,
      });
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notificationIds.includes(notif._id)
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      showToast(
        t("errorMarkingNotifications", "Error marking notifications as read"),
        "error"
      );

      setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
    }
  };

  const handleSearch = useCallback(
    (query) => {
      if (query && query.trim() !== "") {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsMobileMenuOpen(false);
        setIsSearchOverlayOpen(false);
      }
    },
    [navigate]
  );

  const handleMobileMenuToggle = () => {
    if (isUserMenuOpen) setIsUserMenuOpen(false);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleUserMenuToggle = useCallback(() => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    setIsUserMenuOpen(!isUserMenuOpen);
  }, [isMobileMenuOpen, isUserMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markNotificationsAsRead([notification._id]);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }

    setIsNotificationOpen(false);
  };

  const navItems = useMemo(
    () => [
      {
        to: "/",
        icon: FaHome,
        label: ["गृहपृष्ठ", "Home"],
        requiresAuth: false,
      },
      {
        to: "/movies",
        icon: FaFilm,
        label: ["फिल्महरू", "Movies"],
        requiresAuth: false,
      },
      {
        to: "/theaters",
        icon: FaTheaterMasks,
        label: ["हल/थिएटर", "Theaters"],
        requiresAuth: false,
      },
      {
        to: "/offers",
        icon: FaPercent,
        label: ["प्रस्तावहरू", "Offers"],
        requiresAuth: false,
      },
      {
        to: "/my-tickets",
        icon: FaTicketAlt,
        label: ["मेरो टिकटहरू", "My Tickets"],
        requiresAuth: true,
      },
    ],
    []
  );
  const visibleNavItems = useMemo(
    () => navItems.filter((item) => !item.requiresAuth || user),
    [navItems, user]
  );

  const navLinkStyles = ({ isActive }) =>
    `relative group flex items-center gap-2 font-medium transition-colors duration-300 py-2 ${
      isActive
        ? darkMode
          ? "text-purple-400 font-semibold"
          : "text-purple-600 font-semibold"
        : darkMode
        ? "text-gray-300 hover:text-purple-400"
        : "text-gray-700 hover:text-purple-600"
    }`;
  return (
    <>
      <header className="relative h-16">
        <div
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out  ${
            isScrolled
              ? `h-14 shadow-lg backdrop-blur-lg ${
                  darkMode
                    ? "bg-gray-900/65 border-b border-gray-700/50"
                    : "bg-white/65 border-b border-gray-200/50"
                }`
              : `h-16 ${
                  darkMode
                    ? "bg-gray-900 border-b border-gray-800"
                    : "bg-white border-b border-gray-200"
                }`
          }`}
        >
          <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-full flex items-center justify-between">
            {/* Logo + Tagline */}
            <div className=" flex items-center gap-6">
              <Link to={"/"} className="flex items-center space-x-2 group">
                <div
                  className={`flex items-center justify-center transform transition-transform duration-200 ${
                    isScrolled ? "w-9 h-9" : "w-10 h-10"
                  } bg-gradient-to-br from-purple-600 to-pink-700 rounded-lg group-hover:scale-105 shadow-md`}
                >
                  <span className="text-white font-extrabold text-xl">C</span>
                </div>
                <div
                  className={`hidden sm:block transition-all duration-300 overflow-hidden ${
                    isScrolled ? "w-0 opacity-0" : "w-auto opacity-100"
                  }`}
                >
                  <h1
                    className={`text-xl font-bold bg-gradient-to-r ${
                      darkMode
                        ? "from-purple-400 to-pink-400"
                        : "from-purple-600 to-pink-600"
                    } bg-clip-text text-transparent`}
                  >
                    CinePass
                  </h1>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-4 sm:gap-6 lg:gap-8">
                {visibleNavItems.map((item, index) => (
                  <NavigationItems
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    t={t}
                    darkMode={darkMode}
                    style={{ animationDelay: `${100 + index * 50}ms` }}
                  />
                ))}
              </nav>
            </div>

            {/* Right Side: All Controls */}
            <div className="flex items-center space-x-1  sm:space-x-2 md:space-x-4">
              <button
                onClick={() => setIsSearchOverlayOpen(true)}
                className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-lg `}
              >
                <FiSearch className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={toggleDarkMode}
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 group`}
                title={
                  darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
              >
                {darkMode ? (
                  <FiSun className="w-5 h-5 sm:w-6 sm:h6 text-yellow-500 group-hover:rotate-180 transition-transform duration-300" />
                ) : (
                  <FiMoon className="w-5 h-5 sm:w-6 sm:h6 text-gray-600 group-hover:rotate-12 transition-transform duration-300" />
                )}
              </button>

              <LanguageToggle />
              {user ? (
                <>
                  {/* notifications */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                      className={`relative p-2 rounded-lg transition-all duration-200 group ${
                        darkMode
                          ? "bg-gray-800 hover:bg-gray-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                      title={t("notifications", "Notifications")}
                    >
                      <FiBell
                        className={`w-5 h-5 ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        } group-hover:animate-bounce`}
                      />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    <NotificationDropdown
                      isOpen={isNotificationOpen}
                      notifications={notifications}
                      isLoading={isLoadingNotifications}
                      onNotificationClick={handleNotificationClick}
                      onMarkAllRead={() => {
                        const unreadIds = notifications
                          .filter((n) => !n.isRead)
                          .map((n) => n._id);
                        if (unreadIds.length > 0) {
                          markNotificationsAsRead(unreadIds);
                        }
                      }}
                      onClose={() => setIsNotificationOpen(false)}
                    />
                  </div>

                  {/* User menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      aria-label="User Menu"
                      onClick={handleUserMenuToggle}
                      className={`flex items-center space-x-2 p-1 rounded-full ${
                        darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                      } transition-all duration-200 group`}
                    >
                      {user.avatar ? (
                        <img
                          src={getUserAvatarUrl(user)}
                          alt={user.username}
                          className={`w-8 h-8 rounded-full object-cover border-2 ${
                            darkMode ? "border-gray-600" : "border-gray-200"
                          } group-hover:border-red-400 transition-colors duration-200`}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                          <span>
                            {user.username?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                      <span
                        className={`hidden sm:block text-sm font-medium ${
                          darkMode
                            ? "text-gray-300 group-hover:text-red-400"
                            : "text-gray-700 group-hover-text-red-600"
                        } transition-colors duration-200`}
                      >
                        {user.username}
                      </span>
                      <FiChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          isUserMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {/* user dropdown */}
                    {user && isUserMenuOpen && (
                      <div
                        className={`absolute top-full right-0 mt-2 w-56 origin-top-right rounded-md shadow-xl border ${
                          darkMode
                            ? "bg-gray-800 ring-1 ring-black/5 border-gray-700"
                            : "bg-white ring-1 ring-black/5 border-gray-200"
                        } focus:outline-none animate-dropdown-in z-[60]`}
                        tabIndex="-1"
                      >
                        <div className="py-1">
                          <div
                            className={`px-4 py-3 border-b ${
                              darkMode ? "border-gray-700" : " border-gray-200"
                            }`}
                          >
                            <p
                              className={`text-sm font-medium ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {user.username}
                            </p>
                            <p
                              className={`text-xs ${
                                darkMode ? "text-gray-500" : "text-gray-500"
                              } truncate`}
                            >
                              {user.email}
                            </p>
                          </div>

                          <div className="py-1">
                            <Link
                              to={`/user/${user.username}`}
                              className={`group flex items-center w-full text-sm space-x-3 px-4 py-2 ${
                                darkMode
                                  ? "hover:bg-gray-700"
                                  : "hover:bg-gray-100"
                              } transition-colors duration-200 group`}
                              onClick={() => setIsUserMenuOpen(false)}
                              tabIndex={"-1"}
                            >
                              <FiUser className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                              <span
                                className={`text-sm ${
                                  darkMode
                                    ? "text-gray-300 group-hover:text-white"
                                    : "text-gray-700 group-hover:text-gray-900"
                                }`}
                              >
                                {t("प्रोफाइल", "Profile")}
                              </span>
                            </Link>

                            <Link
                              to={"/my-tickets"}
                              className={`group flex items-center w-full text-sm space-x-3 px-4 py-2 ${
                                darkMode
                                  ? "hover:bg-gray-700"
                                  : "hover:bg-gray-100"
                              } transition-colors duration-200 group`}
                              onClick={() => setIsUserMenuOpen(false)}
                              tabIndex={"-1"}
                            >
                              <FaTicket className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                              <span
                                className={`text-sm ${
                                  darkMode
                                    ? "text-gray-300 group-hover:text-white"
                                    : "text-gray-700 group-hover:text-gray-900"
                                }`}
                              >
                                {t("मेरा टिकटहरू", "My Tickets")}
                              </span>
                            </Link>

                            {user.role === "admin" && (
                              <Link
                                to={"/admin"}
                                className={`group flex items-center w-full text-sm space-x-3 px-4 py-2 ${
                                  darkMode
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                                } transition-colors duration-200 `}
                                onClick={() => setIsUserMenuOpen(false)}
                                tabIndex={"-1"}
                              >
                                <FiSettings className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                                <span
                                  className={`text-sm ${
                                    darkMode
                                      ? "text-gray-300 group-hover:text-white"
                                      : "text-gray-700 group-hover:text-gray-900"
                                  }`}
                                >
                                  {t("एडमिन प्यानल", "Admin Panel")}
                                </span>
                              </Link>
                            )}
                          </div>

                          <div className="py-1">
                            <hr
                              className={`my-2 ${
                                darkMode ? "border-gray-600" : "border-gray-200"
                              }`}
                            />
                            <button
                              onClick={handleLogout}
                              className="group flex items-center w-full text-sm space-x-3 px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors duration-200 group"
                            >
                              <FiLogOut className="w-4 h-4 text-red-500" />
                              <span
                                className={`text-sm ${
                                  darkMode ? "text-red-400" : "text-red-600"
                                }`}
                              >
                                {t("लगआउट", "Logout")}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => {
                      openSignInModal();
                    }}
                    className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium  ${
                      darkMode
                        ? "text-gray-300 hover:text-red-400 "
                        : "text-gray-700 hover:text-red-600"
                    }  transition-colors duration-200`}
                  >
                    {t("लगइन", "Login")}
                  </button>
                  <button
                    onClick={() => {
                      openRegisterModal();
                    }}
                    className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    {t("दर्ता", "Register")}
                  </button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={handleMobileMenuToggle}
                className={`lg:hidden p-1.5 sm:p-2 rounded-lg ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-100 hover:bg-gray-200"
                } transition-all duration-200`}
              >
                {isMobileMenuOpen ? (
                  <FiX className="w-4 sm:w-5 h-4 sm:h-5" />
                ) : (
                  <FiMenu className="w-4 sm:w-5 h-4 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div
            className={`fixed top-16 left-0 w-full lg:hidden py-4 border-t animate-dropdown-in z-[60]
                        ${
                          darkMode
                            ? "bg-gray-900 border-gray-700"
                            : "bg-white border-gray-200"
                        }`}
          >
            <div className="flex justify-between items-center px-4 mb-4">
              <div className="px-4 mb-4">
                <SearchBar
                  onSearch={(query) => {
                    handleSearch(query);
                    setIsMobileMenuOpen(false);
                  }}
                  placeholder={t("सिनेमा खोज्नुहोस्...", "Search movies...")}
                  onResultClick={() => setIsMobileMenuOpen(false)}
                />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2"
              >
                <FiX />
              </button>
            </div>

            <nav className="space-y-1 px-4">
              {navItems
                .filter((item) => !item.requiresAuth || user)
                .map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium  ${
                      darkMode
                        ? "text-gray-300 hover:text-purple-400 hover:bg-gray-700"
                        : "text-gray-700 hover:text-purple-600  hover:bg-gray-100 "
                    } transition-colors duration-200`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {t(...label)}
                  </Link>
                ))}
            </nav>
          </div>
        )}

        {/* Search Overlay */}
        {isSearchOverlayOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsSearchOverlayOpen(false)}
          >
            <div
              className="absolute top-[15%] left-1/2 -translate-x-1/2 w-11/12 max-w-xl animate-slide-in-nav"
              style={{ animationDuration: "0.3s" }}
              onClick={(e) => e.stopPropagation()}
            >
              <SearchBar
                onSearch={handleSearch}
                onResultClick={() => setIsSearchOverlayOpen(false)}
                placeholder={t(
                  "Search for movies, actors, directors...",
                  "Search for movies, actors, directors..."
                )}
              />
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default Header;
