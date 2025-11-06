import { FaGlobe } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";

function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      id="langugaeToggle"
      className="flex items-center cursor-pointer text-[1.2em] gap-1.5 "
      onClick={toggleLanguage}
    >
      <FaGlobe />
      <span className="text-sm font-medium">
        {language === "en" ? "EN" : "NP"}
      </span>
    </button>
  );
}

export default LanguageToggle;
