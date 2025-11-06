import { createContext, useCallback, useContext, useState } from "react";
import { useTheme } from "./ThemeContext";
import { useLanguage } from "./LanguageContext";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random().toString(30).substring(2, 8)}`;

    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toasts toasts={toasts} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

function Toasts({ toasts }) {
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  const toastStyles = {
    success: {
      classes: "bg-green-600 text-white",
      icon: <FaCheckCircle />,
    },
    error: {
      classes: "bg-red-600 text-white",
      icon: <FaExclamationCircle />,
    },
    info: {
      classes: "bg-blue-600 text-white",
      icon: <FaInfoCircle />,
    },
    warning: {
      classes: "bg-yellow-500 text-black",
      icon: <FaExclamationTriangle />,
    },
    default: {
      classes: "bg-gray-700 text-white",
      icon: <FaInfoCircle />,
    },
  };

  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 space-y-3`}
    >
      {toasts.map(({ id, message, type }) => {
        const style = toastStyles[type] || toastStyles.default;
        return (
          <div
            key={id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-md animate-slide-up-fade transition-all duration-300 text-sm font-medium ${style.classes}`}
          >
            <span className="text-lg">{style.icon}</span>
            <span>{t(message, message)}</span>
          </div>
        );
      })}
    </div>
  );
}
