import React from "react";
import {
  FaClock,
  FaFilm,
  FaPercent,
  FaTheaterMasks,
  FaTicketAlt,
  FaUsers,
} from "react-icons/fa";
import { NavLink, Outlet } from "react-router";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

function AdminLayout() {
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
      isActive
        ? "bg-purple-600 text-white"
        : darkMode
        ? "hover:bg-gray-700"
        : "hover:bg-gray-200"
    } `;
  return (
    <div className="container mx-auto flex gap-8 p-4 md:p-8">
      {/* sidebar */}
      <aside
        className={`w-1/4 md:w-1/5 lg:w-1/6 p-4 rounded-lg shadow-md ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2 className="text-xl font-bold mb-6 border-b pb-2">
          {" "}
          {t("एडमिन मेनु", "Admin Menu")}
        </h2>
        <nav className="flex flex-col gap-2">
          <NavLink to="/admin/movies" className={navLinkClass}>
            <FaFilm /> {t("चलचित्र व्यवस्थापन", "Manage Movies")}
          </NavLink>
          <NavLink to="/admin/theaters" className={navLinkClass}>
            <FaTheaterMasks /> {t("सिनेमाघर व्यवस्थापन", "Manage Theaters")}
          </NavLink>
          <NavLink to="/admin/showtimes" className={navLinkClass}>
            <FaClock /> {t("शो समय व्यवस्थापन", "Manage Showtimes")}
          </NavLink>
          <NavLink to="/admin/bookings" className={navLinkClass}>
            <FaTicketAlt /> {t("बुकिङ व्यवस्थापन", "Booking Management")}
          </NavLink>
          <NavLink to="/admin/offers" className={navLinkClass}>
            <FaPercent /> {t("अफर व्यवस्थापन", "Manage Offers")}
          </NavLink>
          {/*<NavLink to="/admin/users" className={navLinkClass}>
            <FaUsers /> {t("प्रयोगकर्ता व्यवस्थापन", "Manage Users")}
          </NavLink> */}
        </nav>
      </aside>

      {/* main */}
      <main className="w-3/4 md:w-4/5 lg:w-5/6">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
