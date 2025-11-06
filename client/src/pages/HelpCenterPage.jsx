import React, { useEffect } from "react";
import { Link } from "react-router";
import {
  FaQuestionCircle,
  FaTicketAlt,
  FaUser,
  FaCreditCard,
  FaPhone,
  FaEnvelope,
  FaComments,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import AnimatedSection from "../components/common/AnimatedSection";

const HelpCategoryCard = ({ category, index }) => {
  const { darkMode } = useTheme();
  return (
    <div
      className={`p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center mb-4">
        <div
          className={`p-3 rounded-lg mr-4 ${
            darkMode
              ? "bg-purple-600/20 text-purple-400"
              : "bg-purple-100 text-purple-600"
          }`}
        >
          <category.icon className="text-2xl" />
        </div>
        <h3
          className={`text-xl font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {category.title}
        </h3>
      </div>
      <p
        className={`text-sm mb-4 ${
          darkMode ? "text-gray-300" : "text-gray-600"
        }`}
      >
        {category.description}
      </p>
      <ul className="space-y-2">
        {category.articles.map((article, index) => (
          <li key={index}>
            <Link
              to="/faq"
              className={`text-sm hover:text-purple-500 transition-colors flex items-center ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 shrink-0"></span>{" "}
              {article}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const HelpCenterPage = () => {
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  });

  const helpCategories = [
    {
      id: 1,
      title: t("बुकिंग र टिकटहरू", "Booking & Tickets"),
      icon: FaTicketAlt,
      description: t(
        "बुकिंग, सिट चयन, र बुकिंग व्यवस्थापन बारे सबै कुरा।",
        "Everything about booking, seat selection, and managing your bookings."
      ),
      articles: [
        t("कसरी टिकट बुक गर्ने", "How to Book Tickets"),
        t("बुकिंग रद्द गर्ने", "Canceling Bookings"),
        t("टिकट ढाँचाहरू", "Ticket Formats"),
      ],
    },
    {
      id: 2,
      title: t("भुक्तानी र फिर्ता", "Payments & Refunds"),
      icon: FaCreditCard,
      description: t(
        "भुक्तानी विधिहरू, कारोबार समस्याहरू, र फिर्ता नीतिहरू।",
        "Payment methods, transaction issues, and refund policies."
      ),
      articles: [
        t("स्वीकृत भुक्तानी विधिहरू", "Accepted Payment Methods"),
        t("भुक्तानी सुरक्षा", "Payment Security"),
        t("फिर्ता प्रक्रिया", "Refund Process"),
      ],
    },
    {
      id: 3,
      title: t("खाता र प्रोफाइल", "Account & Profile"),
      icon: FaUser,
      description: t(
        "आफ्नो प्रोफाइल, प्राथमिकताहरू, र खाता सेटिङहरू व्यवस्थापन गर्ने।",
        "Managing your profile, preferences, and account settings."
      ),
      articles: [
        t("प्रोफाइल व्यवस्थापन", "Profile Management"),
        t("पासवर्ड रिसेट", "Password Reset"),
        t("सूचना सेटिङहरू", "Notification Settings"),
      ],
    },
  ];

  const contactOptions = [
    {
      icon: FaPhone,
      title: t("फोन समर्थन", "Phone Support"),
      description: t(
        "तत्काल सहायताको लागि हामीलाई कल गर्नुहोस्।",
        "Call us for immediate assistance."
      ),
      contact: "+977 9866694690",
    },
    {
      icon: FaEnvelope,
      title: t("इमेल समर्थन", "Email Support"),
      description: t(
        "हामीलाई इमेल पठाउनुहोस् र हामी २४ घण्टा भित्र जवाफ दिनेछौं।",
        "Send us an email for detailed queries."
      ),
      contact: "cinepass362@gmail.com",
    },
    {
      icon: FaComments,
      title: t("लाइभ च्याट", "Live Chat"),
      description: t(
        "हाम्रो समर्थन टोलीसँग वास्तविक समयमा कुराकानी गर्नुहोस्।",
        "Chat with our support team in real-time."
      ),
      contact: t("च्याट सुरु गर्नुहोस्", "Start Chat"),
    },
  ];

  return (
    <div
      className={`min-h-screen py-12 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <AnimatedSection
          animation="fadeIn"
          duration={800}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {t("हामी कसरी मद्दत गर्न सक्छौं?", "How can we help?")}
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t(
              "टिकट बुकिंग, खाता व्यवस्थापन, र थपको लागि मद्दत पाउनुहोस्।",
              "Find help with booking tickets, managing your account, and more."
            )}
          </p>
        </AnimatedSection>

        <AnimatedSection animation="slideUp" duration={600}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {helpCategories.map((category, index) => (
              <HelpCategoryCard
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fadeIn" duration={800}>
          <div
            className={`text-center p-8 rounded-xl ${
              darkMode
                ? "bg-gray-800 border-purple-500/30"
                : "bg-purple-50 border-purple-200"
            } border`}
          >
            <h2
              className={`text-3xl font-bold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t("अझै मद्दत चाहिन्छ?", "Still Need Help?")}
            </h2>
            <p
              className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              {t(
                "हाम्रो समर्थन टोली तपाईंलाई सहयोग गर्न तयार छ।",
                "Our support team is ready to assist you."
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {contactOptions.map((option, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg text-center transform transition-transform duration-300 hover:scale-105 ${
                    darkMode ? "bg-gray-700" : "bg-white shadow-md"
                  }`}
                >
                  <option.icon className="text-3xl text-purple-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                  <p
                    className={`text-sm font-semibold ${
                      darkMode ? "text-purple-300" : "text-purple-600"
                    }`}
                  >
                    {option.contact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default HelpCenterPage;
