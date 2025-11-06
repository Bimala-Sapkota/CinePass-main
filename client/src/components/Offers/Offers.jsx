import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { FaTicketAlt, FaCut, FaInfoCircle } from "react-icons/fa";
import { FiCopy } from "react-icons/fi";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router";
import api from "../../services/api";

const OfferCard = ({ offer, index }) => {
  const { darkMode } = useTheme();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(offer.promoCode);
    showToast(t("प्रोमो कोड प्रतिलिपि भयो!", "Promo code copied!"), "success");
  };

  const handleBookNow = () => {
    navigate("/movies");
  };

  const locale = language === "np" ? "ne-NP" : "en-US";
  const validUntilDate = new Date(offer.validUntil).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`relative flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group animate-slide-in-from-bottom border ${
        darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
      }`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Left Side - Details */}
      <div className="p-6 md:p-8 flex-1">
        <div
          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${
            darkMode
              ? "bg-purple-600/20 text-purple-400"
              : "bg-purple-100 text-purple-700"
          }`}
        >
          {offer.discountType === "percentage"
            ? t(`${offer.discountValue}% छुट`, `${offer.discountValue}% OFF`)
            : t(
                `रु. ${offer.discountValue} छुट`,
                `NRs. ${offer.discountValue} OFF`
              )}
        </div>
        <h3 className="text-2xl md:text-3xl font-bold mb-2 tracking-wide">
          {offer.promoCode}
        </h3>
        <p
          className={`mb-4 text-base ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {offer.description}
        </p>
        <div
          className={`flex items-center text-xs ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <FaInfoCircle className="mr-2" />
          <span>
            {t("म्याद सकिने", "Valid until")}: {validUntilDate}
            {offer.minPurchaseAmount > 0 &&
              ` | ${t("न्यूनतम खरिद", "Min. purchase")}: रु. ${
                offer.minPurchaseAmount
              }`}
          </span>
        </div>
      </div>

      {/* Right Side - Action */}
      <div
        className={`relative p-6 md:p-8 flex flex-col items-center justify-center shrink-0 md:w-56 overflow-hidden ${
          darkMode ? "bg-gray-700/50" : "bg-gray-50"
        }`}
      >
        <div
          className={`absolute -left-5 w-10 h-10 rounded-full ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        ></div>
        <div
          className={`absolute -right-5 w-10 h-10 rounded-full md:hidden ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        ></div>
        <div
          className={`absolute -top-5 w-10 h-10 rounded-full md:hidden ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        ></div>
        <div
          className={`absolute -bottom-5 w-10 h-10 rounded-full md:hidden ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        ></div>

        <p className="font-semibold text-lg">{t("Use Code", "Use Code")}</p>
        <div
          onClick={handleCopyCode}
          className={`my-3 px-6 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            darkMode
              ? "border-purple-400 text-purple-300 hover:bg-purple-900/40"
              : "border-purple-500 text-purple-700 hover:bg-purple-100"
          }`}
        >
          <span className="text-2xl font-bold tracking-widest">
            {offer.promoCode}
          </span>
        </div>
        <button
          onClick={handleBookNow}
          className="w-full flex items-center justify-center py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all duration-300 transform hover:scale-105"
        >
          <FaTicketAlt className="mr-2" /> {t("अब बुक गर्नुहोस्", "Book Now")}
        </button>
      </div>
    </div>
  );
};

function Offers() {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const controller = new AbortController();
    const { signal } = controller;
    const fetchActiveOffers = async () => {
      try {
        const res = await api.get("/offers/active", { signal });
        setOffers(res.data.data);
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error("Failed to fetch offers:", error);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchActiveOffers();
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section className="min-h-[65vh] py-8 md:py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h1
            className={`text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent animate-fade-in-down`}
          >
            {t("विशेष अफरहरू", "Special Offers")}
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              darkMode ? "text-gray-300" : "text-gray-600"
            } animate-fade-in-down`}
            style={{ animationDelay: "200ms" }}
          >
            {t(
              "आफ्नो चलचित्र अनुभवलाई अझ राम्रो बनाउन विशेष छुट र सम्झौताहरूको आनन्द लिनुहोस्।",
              "Enjoy exclusive discounts and deals to make your movie experience even better."
            )}
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className={`h-64 rounded-xl ${
                  darkMode ? "bg-gray-800" : "bg-gray-200"
                } animate-pulse`}
              ></div>
            ))}
          </div>
        )}

        {!loading && offers.length === 0 && (
          <div
            className={`text-center py-20 rounded-xl ${
              darkMode ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <FaTicketAlt
              className={`w-16 h-16 mx-auto mb-4 ${
                darkMode ? "text-gray-600" : "text-gray-300"
              }`}
            />
            <h3 className="text-xl font-semibold">
              {t("अहिले कुनै अफर छैन", "No Offers Available")}
            </h3>
            <p
              className={`mt-2 text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {t(
                "कृपया पछि फेरि जाँच गर्नुहोस्।",
                "Please check back later for exciting deals."
              )}
            </p>
          </div>
        )}

        {!loading && offers.length > 0 && (
          <div className="grid grid-cols-1  gap-8">
            {offers.map((offer, index) => (
              <OfferCard key={offer._id} offer={offer} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Offers;
