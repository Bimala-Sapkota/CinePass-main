import React, { useEffect, useState } from "react";
import TheaterForm from "./TheaterForm";
import { useTheme } from "../../context/ThemeContext";
import { FaEdit, FaTrash } from "react-icons/fa";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";

function ManageTheatersPage() {
  const { t } = useLanguage();
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theaterToEdit, setTheaterToEdit] = useState(null);

  const fetchTheaters = async () => {
    setLoading(true);
    try {
      const response = await api.get("/theaters");
      setTheaters(response.data.data);
    } catch (error) {
      console.error("Failed to fetch theaters:", error);
      showToast(
        t("थिएटरहरू ल्याउन असफल भयो", "Failed to fetch theaters"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheaters();
    window.scrollTo(0, 0);
  }, []);

  const handleSuccess = () => {
    setTheaterToEdit(null);
    fetchTheaters();
  };

  const handleDelete = async (theaterId) => {
    const confirmMsg = t(
      "के तपाईं यो थिएटर मेटाउन चाहनुहुन्छ?",
      "Are you sure you want to delete this theater?"
    );
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/theaters/${theaterId}`);
      setTheaters((prevTheaters) =>
        prevTheaters.filter((t) => t._id !== theaterId)
      );
      showToast(
        t("थिएटर सफलतापूर्वक मेटाइयो!", "Theater deleted successfully!"),
        "success"
      );
    } catch (error) {
      console.error("Failed to delete theater:", error);
      showToast(
        t(
          "थिएटर मेटाउन असफल भयो। यो शो समयद्वारा प्रयोगमा हुन सक्छ।",
          "Failed to delete theater. It may be in use by a showtime."
        ),
        "error"
      );
      fetchTheaters();
    }
  };

  const handleEdit = (theater) => {
    setTheaterToEdit(theater);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setTheaterToEdit(null);
  };

  return (
    <div>
      <TheaterForm
        theaterToEdit={theaterToEdit}
        onFormSubmit={handleSuccess}
        onCancel={handleCancel}
      />

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          {t("अवस्थित थिएटरहरू", "Existing Theaters")}
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {t("थिएटरहरू लोड हुँदैछन्...", "Loading theaters...")}
            </p>
          </div>
        ) : theaters.length === 0 ? (
          <div
            className={`text-center py-8 ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t(
              "कुनै थिएटर भेटिएन। माथि आफ्नो पहिलो थिएटर थप्नुहोस्!",
              "No theaters found. Add your first theater above!"
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              className={`min-w-full divide-y ${
                darkMode ? "divide-gray-700" : "divide-gray-200"
              }`}
            >
              <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    {t("नाम", "Name")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    {t("स्थान", "Location")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    {t("शहर", "City")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    {t("स्क्रिनहरू", "Screens")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    {t("कार्यहरू", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  darkMode
                    ? "bg-gray-800 divide-gray-700"
                    : "bg-white divide-gray-200"
                }`}
              >
                {theaters.map((theater) => (
                  <tr
                    key={theater._id}
                    className={`${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium">{theater.name}</td>
                    <td className="px-6 py-4">{theater.location}</td>
                    <td className="px-6 py-4">{theater.city}</td>
                    <td className="px-6 py-4">
                      {theater.screens?.length || 0} {t("स्क्रिन", "screen")}
                      {theater.screens?.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleEdit(theater)}
                          className={` ${
                            darkMode
                              ? "text-purple-400 hover:text-purple-300"
                              : "hover:text-purple-900 text-purple-600"
                          } transition-colors`}
                          title="Edit Theater"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(theater._id)}
                          className={`${
                            darkMode
                              ? "text-red-400 hover:text-red-300"
                              : "text-red-600 hover:text-red-900"
                          } transition-colors`}
                          title="Delete Theater"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageTheatersPage;
