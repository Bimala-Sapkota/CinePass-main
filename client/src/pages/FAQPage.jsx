import React, { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import AnimatedSection from "../components/common/AnimatedSection";

const faqData = [
  {
    id: 1,
    q_en: "How do I book movie tickets?",
    a_en: "You can book tickets by browsing movies, selecting a showtime, choosing your seats, and completing the payment. You must be logged in to complete a booking.",
    q_np: "म कसरी चलचित्र टिकट बुक गर्न सक्छु?",
    a_np: "तपाईं चलचित्रहरू ब्राउज गरेर, शो-टाइम चयन गरेर, सिटहरू छानेर, र भुक्तानी प्रक्रिया पूरा गरेर टिकट बुक गर्न सक्नुहुन्छ। बुकिंग पूरा गर्न तपाईं लगइन हुनुपर्छ।",
  },
  {
    id: 2,
    q_en: "Can I cancel my booking?",
    a_en: 'Yes, bookings can be cancelled up to 2 hours before the showtime directly from your "My Tickets" page. The refund will be processed according to the payment method used.',
    q_np: "के म मेरो बुकिंग रद्द गर्न सक्छु?",
    a_np: 'हो, शो-टाइम भन्दा २ घण्टा अगाडि "मेरो टिकट" पृष्ठबाट बुकिंग रद्द गर्न सकिन्छ। भुक्तानी विधि अनुसार फिर्ता प्रक्रिया गरिनेछ।',
  },
  {
    id: 3,
    q_en: "What payment methods are accepted?",
    a_en: "We currently accept payments via Khalti and eSewa, two of Nepal's leading digital wallets, ensuring your transactions are secure and seamless.",
    q_np: "कुन भुक्तानी विधिहरू स्वीकार गरिन्छ?",
    a_np: "हामी हाल नेपालका प्रमुख डिजिटल वालेटहरू, खल्ती र इसेवा मार्फत भुक्तानी स्वीकार गर्दछौं, जसले तपाईंको कारोबार सुरक्षित र सहज बनाउँछ।",
  },
  {
    id: 4,
    q_en: "How do I get my tickets after booking?",
    a_en: 'Your digital ticket, complete with a QR code, is sent to your email and is also available in the "My Tickets" section of your user dashboard. Simply show the QR code at the theater entrance.',
    q_np: "बुकिंग पछि मैले मेरो टिकट कसरी पाउँछु?",
    a_np: 'तपाईंको QR कोड सहितको डिजिटल टिकट तपाईंको इमेलमा पठाइन्छ र तपाईंको प्रयोगकर्ता ड्यासबोर्डको "मेरो टिकट" खण्डमा पनि उपलब्ध हुन्छ। हलको प्रवेशद्वारमा केवल QR कोड देखाउनुहोस्।',
  },
  {
    id: 5,
    q_en: "I forgot my password. How do I reset it?",
    a_en: 'On the login screen, click the "Forgot Password?" link. Enter your registered email address, and we will send you a secure link to reset your password.',
    q_np: "मैले मेरो पासवर्ड बिर्सिएँ। कसरी रिसेट गर्ने?",
    a_np: 'लगइन स्क्रिनमा, "पासवर्ड बिर्सनुभयो?" लिङ्कमा क्लिक गर्नुहोस्। आफ्नो दर्ता गरिएको इमेल ठेगाना प्रविष्ट गर्नुहोस्, र हामी तपाईंलाई पासवर्ड रिसेट गर्न एक सुरक्षित लिङ्क पठाउनेछौं।',
  },
  {
    id: 6,
    q_en: "How do I use a promotional code?",
    a_en: "During the final step of the booking process (Review & Pay), you will see a field to enter your promo code. The discount will be applied to your total if the code is valid.",
    q_np: "म प्रोमोशनल कोड कसरी प्रयोग गर्न सक्छु?",
    a_np: "बुकिंग प्रक्रियाको अन्तिम चरणमा (समीक्षा र भुक्तानी), तपाईंले आफ्नो प्रोमो कोड प्रविष्ट गर्ने ठाउँ पाउनुहुनेछ। यदि कोड मान्य छ भने तपाईंको कुल रकममा छुट लागू हुनेछ।",
  },
];

const FAQItem = ({ faq, isOpen, onToggle, index }) => {
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  });
  const animationClass =
    index % 2 === 0 ? "animate-slide-in-left" : "animate-slide-in-right";

  return (
    <div
      className={`border-b ${
        darkMode ? "border-gray-700" : "border-gray-200"
      } ${animationClass}`}
      style={{ animationDuration: "0.8s" }}
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-5 text-left flex items-center justify-between group"
        aria-expanded={isOpen}
      >
        <h3
          className={`text-lg font-semibold transition-colors duration-300 ${
            isOpen
              ? "text-purple-500"
              : darkMode
              ? "text-white group-hover:text-purple-400"
              : "text-gray-800 group-hover:text-purple-600"
          }`}
        >
          {t(faq.q_np, faq.q_en)}
        </h3>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-4 transition-all duration-300 ${
            isOpen
              ? "bg-purple-600 text-white transform rotate-180"
              : darkMode
              ? "bg-gray-700 group-hover:bg-purple-500"
              : "bg-gray-200 group-hover:bg-purple-600 group-hover:text-white"
          }`}
        >
          <FaChevronDown className="w-4 h-4" />
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-4 pb-5">
          <p
            className={`leading-relaxed ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t(faq.a_np, faq.a_en)}
          </p>
        </div>
      </div>
    </div>
  );
};

const FAQPage = () => {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div
      className={`min-h-screen py-12 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4">
        <AnimatedSection
          animation="fadeIn"
          duration={800}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {t("बारम्बार सोधिने प्रश्नहरू", "Frequently Asked Questions")}
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t(
              "तपाईंका प्रश्नहरूको उत्तर यहाँ छ।",
              "Have questions? We have answers."
            )}
          </p>
        </AnimatedSection>

        <div
          className={`rounded-xl shadow-xl overflow-hidden ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {faqData.map((faq, index) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              index={index}
              isOpen={expandedId === faq.id}
              onToggle={() =>
                setExpandedId(expandedId === faq.id ? null : faq.id)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
