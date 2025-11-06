import React, { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

const PrivacyPolicyPage = () => {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  useEffect(() => window.scrollTo(0, 0));

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
          {t("गोपनीयता नीति", "Privacy Policy")}{" "}
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
              `सिनेपासमा, हामी तपाईंको गोपनीयताको रक्षा गर्न र
तपाईंको व्यक्तिगत जानकारीको सुरक्षा सुनिश्चित गर्न प्रतिबद्ध छौं। यो गोपनीयता
नीतिले तपाईंले हाम्रो चलचित्र टिकट बुकिङ प्लेटफर्म प्रयोग गर्दा
हामी तपाईंको डेटा कसरी सङ्कलन, प्रयोग र सुरक्षा गर्छौं भनेर व्याख्या गर्दछ।`,
              `At CinePass, we are committed to protecting your privacy and
            ensuring the security of your personal information. This Privacy
            Policy explains how we collect, use, and safeguard your data when
            you use our movie ticket booking platform.`
            )}
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("हामीले सङ्कलन गर्ने जानकारी", "Information We Collect")}
          </h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            {t("व्यक्तिगत जानकारी", "Personal Information")}
          </h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              {t(
                "नाम, इमेल ठेगाना, र फोन नम्बर",
                "Name, email address, and phone number"
              )}
            </li>
            <li>
              {t("प्रोफाइल फोटो (वैकल्पिक)", "Profile picture (optional)")}
            </li>
            <li>
              {t(
                "भुक्तानी जानकारी (तेस्रो-पक्ष प्रदायक मार्फत सुरक्षित रूपमा प्रक्रिया गरिन्छ)",
                "Payment information (processed securely through third-party providers)"
              )}
            </li>
            <li>
              {t(
                "बुकिङ इतिहास र प्राथमिकताहरू",
                "Booking history and preferences"
              )}
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">
            {t("प्रयोग जानकारी", "Usage Information")}
          </h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              {t(
                "डिभाइस जानकारी र आईपी ठेगाना",
                "Device information and IP address"
              )}
            </li>
            <li>{t("ब्राउजर प्रकार र संस्करण", "Browser type and version")}</li>
            <li>
              {t(
                "पृष्ठहरू हेर्ने र समय खर्च गर्ने",
                "Pages visited and time spent on our platform"
              )}
            </li>
            <li>
              {t(
                "खोज प्रश्नहरू र अन्तरक्रियाहरू",
                "Search queries and interactions"
              )}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t(
              "हामी तपाईंको जानकारी कसरी प्रयोग गर्छौं",
              "How We Use Your Information"
            )}
          </h2>
          <ul className="list-disc pl-6 mb-6">
            <li>
              {t(
                "चलचित्र टिकट बुकिङ र भुक्तानी प्रक्रिया गर्न",
                "Process movie ticket bookings and payments"
              )}
            </li>
            <li>
              {t(
                "बुकिङ पुष्टि र अद्यावधिकहरू पठाउन",
                "Send booking confirmations and updates"
              )}
            </li>
            <li>
              {t("ग्राहक सहायता प्रदान गर्न", "Provide customer support")}
            </li>
            <li>
              {t(
                "हाम्रो सेवा र प्रयोगकर्ता अनुभव सुधार गर्न",
                "Improve our services and user experience"
              )}
            </li>
            <li>
              {t(
                "प्रचारात्मक अफरहरू पठाउन (तपाईंको सहमति अनुसार)",
                "Send promotional offers (with your consent)"
              )}
            </li>
            <li>
              {t(
                "ठगी रोक्न र सुरक्षा सुनिश्चित गर्न",
                "Prevent fraud and ensure security"
              )}
            </li>
          </ul>
          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("डेटा सुरक्षा", "Data Security")}
          </h2>
          <p className="mb-6">
            {t(
              "हामी तपाईंको व्यक्तिगत जानकारी सुरक्षित गर्न उद्योग-मानक सुरक्षात्मक उपायहरू कार्यान्वयन गर्छौं:",
              "We implement industry-standard security measures to protect your personal information:"
            )}
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>
              {t(
                "सबै डेटा ट्रान्समिसनको लागि SSL इन्क्रिप्सन",
                "SSL encryption for all data transmission"
              )}
            </li>
            <li>
              {t(
                "विश्वसनीय प्रदायक मार्फत सुरक्षित भुक्तानी प्रक्रिया",
                "Secure payment processing through trusted providers"
              )}
            </li>
            <li>
              {t(
                "नियमित सुरक्षा अडिट र अद्यावधिकहरू",
                "Regular security audits and updates"
              )}
            </li>
            <li>
              {t(
                "व्यक्तिगत जानकारीमा सीमित पहुँच",
                "Limited access to personal information"
              )}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("तपाईंका अधिकारहरू", "Your Rights")}
          </h2>
          <p className="mb-4">
            {t(
              "तपाईंले निम्न अधिकारहरू राख्नुहुन्छ:",
              "You have the right to:"
            )}
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>
              {t(
                "तपाईंको व्यक्तिगत जानकारी पहुँच गर्नु",
                "Access your personal information"
              )}
            </li>
            <li>
              {t("आफ्नो डेटा अपडेट वा सच्याउनु", "Update or correct your data")}
            </li>
            <li>
              {t("आफ्नो खाता र डेटा मेटाउनु", "Delete your account and data")}
            </li>
            <li>
              {t(
                "मार्केटिङ सञ्चारबाट अप्ट-आउट गर्नु",
                "Opt-out of marketing communications"
              )}
            </li>
            <li>
              {t(
                "डेटा पोर्टेबिलिटीको अनुरोध गर्नु",
                "Request data portability"
              )}
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            {t("हामीलाई सम्पर्क गर्नुहोस्", "Contact Us")}
          </h2>
          <p className="mb-4">
            {t(
              "यदि तपाईंलाई यो गोपनीयता नीति वा हाम्रो डेटा अभ्यासहरू सम्बन्धी कुनै प्रश्न छ भने, कृपया हामीलाई सम्पर्क गर्नुहोस्:",
              "If you have any questions about this Privacy Policy or our data practices, please contact us:"
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

export default PrivacyPolicyPage;
