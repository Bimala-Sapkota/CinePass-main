import React, { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

const TermsConditionsPage = () => {
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <div
      className={`min-h-screen px-4 py-8 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <h1
          className={`text-4xl font-bold mb-8 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {t("नियम तथा सर्तहरू", "Terms & Conditions")}
        </h1>

        <div
          className={`prose prose-lg max-w-none ${
            darkMode ? "prose-invert" : ""
          }`}
        >
          <p className="text-lg mb-6">
            <strong>{t("प्रभावकारी मिति:", "Effective Date:")}</strong>{" "}
            {t("जनवरी १, २०२५", "January 1, 2025")}
          </p>

          <p className="mb-6">
            {t(
              "CinePass मा स्वागत छ। हाम्रो प्लेटफर्म पहुँच गरी प्रयोग गरेर, तपाईं यी नियम तथा सर्तहरूमा सहमत हुनुहुन्छ। कृपया सेवा प्रयोग गर्नु अघि ध्यान दिएर पढ्नुहोस्।",
              "Welcome to CinePass. By accessing and using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services."
            )}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("१. नियमहरूको स्वीकृति", "1. Acceptance of Terms")}
          </h2>
          <p className="mb-6">
            {t(
              "CinePass प्रयोग गरेर, तपाईं यी नियम तथा सर्तहरूमा सहमत हुनुहुन्छ। यदि तपाईं सहमत हुनुहुन्न भने, कृपया हाम्रो सेवा प्रयोग नगर्नुहोस्।",
              "By using CinePass, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services."
            )}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("२. प्रयोगकर्ता खाता", "2. User Accounts")}
          </h2>
          <ul className="list-disc pl-6 mb-6">
            <li>
              {t(
                "खाता बनाउनको लागि कम्तीमा १३ वर्षको हुनु अनिवार्य छ",
                "You must be at least 13 years old to create an account"
              )}
            </li>
            <li>
              {t(
                "तपाईं आफ्नो खाताको सुरक्षाको लागि जिम्मेवार हुनुहुन्छ",
                "You are responsible for maintaining the security of your account"
              )}
            </li>
            <li>
              {t(
                "तपाईंले सटीक र पूर्ण जानकारी प्रदान गर्नुपर्छ",
                "You must provide accurate and complete information"
              )}
            </li>
            <li>
              {t(
                "प्रत्येक व्यक्तिका लागि एकमात्र खाता अनुमति छ",
                "One account per person is allowed"
              )}
            </li>
            <li>
              {t(
                "हामी उल्लङ्घनको लागि खाता निलम्बन वा बन्द गर्न सक्छौं",
                "We reserve the right to suspend or terminate accounts for violations"
              )}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("३. बुकिङ र भुक्तानी", "3. Booking and Payments")}
          </h2>
          <ul className="list-disc pl-6 mb-6">
            <li>
              {t(
                "सबै बुकिङ उपलब्धतामा आधारित हुन्छ",
                "All bookings are subject to availability"
              )}
            </li>
            <li>
              {t(
                "मूल्य बुकिङको समयमा देखिएको अनुसार लागू हुनेछ",
                "Prices are as displayed at the time of booking"
              )}
            </li>
            <li>
              {t(
                "बुकिङ पुष्टि गर्न भुक्तानी अनिवार्य छ",
                "Payment must be completed to confirm your booking"
              )}
            </li>
            <li>
              {t(
                "हामी eSewa, Khalti, र प्रमुख क्रेडिट कार्ड स्वीकार गर्छौं",
                "We accept payments through eSewa, Khalti, and major credit cards"
              )}
            </li>
            <li>
              {t(
                "बुकिङ पुष्टि इमेलमार्फत पठाइनेछ",
                "Booking confirmations will be sent via email"
              )}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("४. रद्दीकरण र फिर्ती", "4. Cancellation and Refunds")}
          </h2>
          <ul className="list-disc pl-6 mb-6">
            <li>
              {t(
                "शो सुरु हुनुभन्दा कम्तीमा २ घण्टा अघिसम्म रद्द गर्नुपर्छ",
                "Cancellations must be made at least 2 hours before showtime"
              )}
            </li>
            <li>
              {t(
                "फिर्ती ५-७ कार्य दिनभित्र प्रक्रिया गरिनेछ",
                "Refunds will be processed within 5-7 business days"
              )}
            </li>
            <li>
              {t(
                "रद्द शुल्क थियटरको नीतिअनुसार लाग्न सक्छ",
                "Cancellation fees may apply as per theater policy"
              )}
            </li>
            <li>
              {t(
                "नो-शो वा ढिलो आइपुग्दा कुनै फिर्ती हुँदैन",
                "No refunds for no-shows or late arrivals"
              )}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("५. प्रयोगकर्ताको आचरण", "5. User Conduct")}
          </h2>
          <p className="mb-4">
            {t("प्रयोगकर्ताले निम्न कार्यहरू गर्नु हुँदैन:", "Users must not:")}
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>
              {t(
                "प्लेटफर्मलाई गैरकानुनी कार्यको लागि प्रयोग गर्नु",
                "Use the platform for illegal activities"
              )}
            </li>
            <li>
              {t(
                "हाम्रो सेवामा हैक वा बाधा पुर्‍याउने प्रयास गर्नु",
                "Attempt to hack or disrupt our services"
              )}
            </li>
            <li>{t("धेरै खाता सिर्जना गर्नु", "Create multiple accounts")}</li>
            <li>
              {t(
                "गलत वा भ्रमपूर्ण जानकारी साझा गर्नु",
                "Share false or misleading information"
              )}
            </li>
            <li>
              {t(
                "लागू कानून वा नियम उल्लङ्घन गर्नु",
                "Violate any applicable laws or regulations"
              )}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("६. बौद्धिक सम्पत्ति", "6. Intellectual Property")}
          </h2>
          <p className="mb-6">
            {t(
              "CinePass मा रहेका सबै सामग्रीहरू, जस्तै लोगो, पाठ, तस्बिरहरू, र सफ्टवेयर, प्रतिलिपि अधिकार तथा अन्य बौद्धिक सम्पत्ति कानूनद्वारा सुरक्षित छन्। तपाईंले हाम्रो अनुमति बिना सामग्री प्रयोग गर्न पाउनुहुन्न।",
              "All content on CinePass, including logos, text, images, and software, is protected by copyright and other intellectual property laws. You may not use our content without permission."
            )}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("७. उत्तरदायित्वको सीमा", "7. Limitation of Liability")}
          </h2>
          <p className="mb-6">
            {t(
              "CinePass तपाईंको सेवा प्रयोगसँग सम्बन्धित कुनै पनि अप्रत्यक्ष, आकस्मिक, विशेष वा परिणामी क्षतिको लागि जिम्मेवार हुने छैन। हाम्रो कुल जिम्मेवारी सम्बन्धित बुकिङको लागि तिर्नुभएको रकमभन्दा बढी हुँदैन।",
              "CinePass shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount paid for the relevant booking."
            )}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("८. सर्तहरूमा परिवर्तन", "8. Changes to Terms")}
          </h2>
          <p className="mb-6">
            {t(
              "हामी यी सर्तहरू जुनसुकै बेला परिवर्तन गर्ने अधिकार सुरक्षित राख्छौं। परिवर्तनहरू तुरुन्तै लागू हुनेछन्। हाम्रो सेवा निरन्तर प्रयोग गर्नु परिवर्तनहरूमा सहमत हुनु हो भन्ने बुझिन्छ।",
              "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of our services constitutes acceptance of the modified terms."
            )}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("९. सम्पर्क जानकारी", "9. Contact Information")}
          </h2>
          <p className="mb-4">
            {t(
              "यी नियम तथा सर्तहरू सम्बन्धी कुनै प्रश्न भएमा कृपया हामीलाई सम्पर्क गर्नुहोस्:",
              "For questions about these Terms and Conditions, please contact us:"
            )}
          </p>
          <ul className="list-none mb-6">
            <li>{t("इमेल:", "Email:")} cinepass362@gmail.com</li>
            <li>{t("फोन:", "Phone:")} +977 9866694690</li>
            <li>{t("ठेगाना:", "Address:")} Rupandehi, Nepal</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TermsConditionsPage;
