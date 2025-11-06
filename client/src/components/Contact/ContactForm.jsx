import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import { useEffect } from "react";

function ContactForm() {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [contacts, setContacts] = useState({
    fullName: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setContacts((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/contact", formData);
      if (res.status === 200 || res.status === 201) {
        showToast(
          t("सन्देश सफलतापूर्वक पठाइयो।", "Message sent successfully."),
          "success"
        );
        setFormData({ fullName: "", email: "", message: "" });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        t("सन्देश पठाउन सकिएन।", "Failed to send message.");
      showToast(errorMessage, "error");
      console.error("Contact form submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      className={`w-full max-w-2xl mx-auto my-12 p-8 rounded-2xl shadow-xl transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        {t("सम्पर्क फारम", "Contact Form")}
      </h1>

      <p className="text-center mb-8 text-sm md:text-base text-gray-500 dark:text-gray-400">
        {t(
          "टिकट रद्द, फिर्ती अनुरोध, वा सेवा गुनासोको लागि कृपया फारम भर्नुहोस्। हामी २४ घण्टा भित्र सम्पर्क गर्नेछौं।",
          "For ticket cancellation, refund requests, or service complaints, please fill out the form below. We’ll get back to you within 24 hours."
        )}
      </p>

      <form
        onSubmit={handleFormSubmit}
        className="space-y-6 animate-fade-in"
        autoComplete="off"
      >
        <div className="relative">
          <input
            type="text"
            name="fullName"
            id="fullName"
            required
            value={contacts.fullName}
            onChange={handleInputChange}
            className={`peer w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 pt-5 pb-2 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          />
          <label
            htmlFor="fullName"
            className="absolute left-4 top-2.5 text-sm text-gray-500 transition-all peer-focus:top-1 peer-focus:text-xs peer-focus:text-purple-500 peer-valid:top-1 peer-valid:text-xs"
          >
            {t("पूरा नाम", "Full Name")}
          </label>
        </div>

        <div className="relative">
          <input
            type="email"
            name="email"
            id="email"
            required
            value={contacts.email}
            onChange={handleInputChange}
            className={`peer w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 pt-5 pb-2 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          />
          <label
            htmlFor="email"
            className="absolute left-4 top-2.5 text-sm text-gray-500 transition-all peer-focus:top-1 peer-focus:text-xs peer-focus:text-purple-500 peer-valid:top-1 peer-valid:text-xs"
          >
            {t("इमेल", "Email")}
          </label>
        </div>

        <div className="relative">
          <textarea
            name="message"
            id="message"
            rows="5"
            required
            placeholder={t(
              "कृपया आफ्नो समस्या वर्णन गर्नुहोस् (जस्तै रद्द, फिर्ती, गुनासो)...",
              "Describe your issue (e.g. cancellation, refund, complaint)..."
            )}
            value={contacts.message}
            onChange={handleInputChange}
            className={`peer w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 pt-5 pb-2 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          />
          <label
            htmlFor="message"
            className="absolute left-4 top-2.5 text-sm text-gray-500 transition-all peer-focus:top-1 peer-focus:text-xs peer-focus:text-purple-500 peer-valid:top-1 peer-valid:text-xs"
          >
            {t("सन्देश", "Message")}
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 active:scale-95 active:opacity-90 hover:bg-purple-700"
        >
          {isLoading
            ? t("पठाउँदै...", "Sending...")
            : t("सन्देश पठाउनुहोस्", "Send Message")}
        </button>
      </form>
    </div>
  );
}

export default ContactForm;
