import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";

const initialFormState = {
  promoCode: "",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  minPurchaseAmount: 0,
  validUntil: "",
  isActive: true,
};

function OfferForm({ offerToEdit, onFormSubmit, onCancel }) {
  const { t } = useLanguage();
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (offerToEdit) {
      setFormData({
        ...offerToEdit,
        validUntil: offerToEdit.validUntil
          ? new Date(offerToEdit.validUntil).toISOString().split("T")[0]
          : "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [offerToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...formData,
      discountValue: Number(formData.discountValue),
      minPurchaseAmount: Number(formData.minPurchaseAmount),
    };

    try {
      if (offerToEdit) {
        await api.patch(`/offers/${offerToEdit._id}`, payload);
        showToast("Offer updated successfully!", "success");
      } else {
        await api.post("/offers", payload);
        showToast("Offer created successfully!", "success");
      }
      onFormSubmit();
    } catch (error) {
      showToast(error.response?.data?.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };
  const inputClasses = `w-full p-2 border rounded-md transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${
    darkMode ? `bg-gray-700 border-gray-600` : "bg-white border-gray-300"
  }`;

  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        darkMode ? "bg-gray-800" : "bg-white"
      } mb-8 animate-fade-in`}
    >
      <h2 className="text-2xl font-bold mb-4">
        {offerToEdit
          ? t("अफर सम्पादन गर्नुहोस्", "Edit Offer")
          : t("नयाँ अफर थप्नुहोस्", "Add New Offer")}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("प्रोमो कोड", "Promo Code")}
          </label>
          <input
            name="promoCode"
            value={formData.promoCode}
            onChange={handleChange}
            placeholder={t("जस्तै, CINEPASS20", "e.g., CINEPASS20")}
            required
            className={inputClasses}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g., 20% off on all weekend shows"
            required
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Discount Type
          </label>
          <select
            name="discountType"
            value={formData.discountType}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (NRs.)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Discount Value
          </label>
          <input
            name="discountValue"
            type="number"
            value={formData.discountValue}
            onChange={handleChange}
            placeholder="e.g., 20 or 100"
            required
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Minimum Purchase (NRs.)
          </label>
          <input
            name="minPurchaseAmount"
            type="number"
            value={formData.minPurchaseAmount}
            onChange={handleChange}
            placeholder="e.g., 500"
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Valid Until</label>
          <input
            name="validUntil"
            type="date"
            value={formData.validUntil}
            onChange={handleChange}
            required
            className={`${inputClasses} `}
          />
        </div>
        <div className="md:col-span-2 flex items-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500"
            />
            <span>Is this offer currently active?</span>
          </label>
        </div>
        <div className="md:col-span-2 flex justify-end gap-4">
          {offerToEdit && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 rounded-lg font-semibold bg-gray-500 hover:bg-gray-600 text-white transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white transition disabled:bg-purple-400"
          >
            {loading
              ? "Saving..."
              : offerToEdit
              ? "Update Offer"
              : "Create Offer"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OfferForm;
