import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import OfferForm from "./OfferForm";
import {
  FaEdit,
  FaToggleOff,
  FaToggleOn,
  FaTrash,
  FaSpinner,
  FaPlus,
} from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";

function ManageOffersPage() {
  const { t } = useLanguage();
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offerToEdit, setOfferToEdit] = useState(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/offers");
      setOffers(res.data.data);
    } catch (error) {
      showToast(
        t("प्रस्तावहरू ल्याउन असफल भयो", "Failed to fetch offers"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleFormSuccess = () => {
    setOfferToEdit(null);
    fetchOffers();
  };

  const handleToggleStatus = async (offer) => {
    const originalOffers = [...offers];

    const updatedOffers = offers.map((o) =>
      o._id === offer._id ? { ...o, isActive: !o.isActive } : o
    );
    setOffers(updatedOffers);

    try {
      await api.patch(`/offers/${offer._id}`, { isActive: !offer.isActive });
      showToast(
        t("प्रस्तावको स्थिति अद्यावधिक भयो", "Offer status updated"),
        "success"
      );
    } catch (error) {
      showToast(
        t("स्थिति अद्यावधिक गर्न असफल", "Failed to update status"),
        "error"
      );
      setOffers(originalOffers);
    }
  };

  const handleDelete = async (offerId) => {
    if (!window.confirm(t("के तपाईं निश्चित हुनुहुन्छ?", "Are you sure?")))
      return;
    try {
      await api.delete(`/offers/${offerId}`);
      showToast(t("प्रस्ताव हटाइयो", "Offer deleted"), "success");
      fetchOffers();
    } catch (error) {
      showToast(t("प्रस्ताव मेट्न असफल", "Failed to delete offer"), "error");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {t("प्रस्ताव व्यवस्थापन गर्नुहोस्", "Manage Offers")}
        </h1>
        <button
          onClick={() => setOfferToEdit(null)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
        >
          <FaPlus /> {t("नयाँ प्रस्ताव थप्नुहोस्", "Add New Offer")}
        </button>
      </div>

      <OfferForm
        offerToEdit={offerToEdit}
        onFormSubmit={handleFormSuccess}
        onCancel={() => setOfferToEdit(null)}
      />

      <div
        className={`rounded-xl overflow-hidden ${
          darkMode ? "bg-gray-800" : "bg-white"
        } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
      >
        {loading ? (
          <div className="p-8 text-center">
            <FaSpinner className="animate-spin mx-auto text-3xl text-purple-500" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  {t("प्रोमो कोड", "Promo Code")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  {t("छुट", "Discount")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  {t("वैधता", "Validity")}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase">
                  {t("स्थिति", "Status")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase">
                  {t("कार्यहरू", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {offers.map((offer) => (
                <tr
                  key={offer._id}
                  className={
                    darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold">{offer.promoCode}</div>
                    <div className="text-xs text-gray-500">
                      {offer.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {offer.discountType === "percentage"
                      ? `${offer.discountValue}%`
                      : `NRs. ${offer.discountValue}`}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(offer.validUntil).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(offer)}
                      title="Toggle Status"
                    >
                      {offer.isActive ? (
                        <FaToggleOn className="text-green-500 text-2xl mx-auto cursor-pointer" />
                      ) : (
                        <FaToggleOff className="text-gray-500 text-2xl mx-auto cursor-pointer" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setOfferToEdit(offer)}
                      className="text-purple-500 hover:text-purple-400 mr-4"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(offer._id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageOffersPage;
