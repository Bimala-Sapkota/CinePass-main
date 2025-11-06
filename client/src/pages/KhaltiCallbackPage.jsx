import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { FaCheckCircle, FaSpinner, FaTimesCircle } from "react-icons/fa";

function KhaltiCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  const [verificationStatus, setVerificationStatus] = useState("processing");
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyKhaltiPayment = async () => {
      const params = new URLSearchParams(location.search);
      const pidx = params.get("pidx");
      const purchase_order_id = params.get("purchase_order_id");
      const status = params.get("status");

      if (status !== "Completed") {
        showToast(t("Payment was not completed or was cancelled.", "Payment was not completed or was cancelled."), "error");
        setVerificationStatus("failed");
        setTimeout(() => navigate("/payment/failure", { replace: true }), 3000);
        return;
      }

      if (!pidx || !purchase_order_id) {
        showToast(t("Invalid payment details from Khalti.", "Invalid payment details from Khalti."), "error");
        setVerificationStatus("failed");
        setTimeout(() => navigate("/payment/failure", { replace: true }), 3000);
        return;
      }
      
      try {
        const response = await api.post("/bookings/verify-khalti", {
          pidx,
          purchase_order_id,
        });

        if (response.data.success) {
          setVerificationStatus("success");
          showToast(t("Payment successful! Your booking is confirmed.", "Payment successful! Your booking is confirmed."), "success");
          
          // Clear session storage booking data
          sessionStorage.removeItem("bookingStep");
          sessionStorage.removeItem("bookingShowtime");
          sessionStorage.removeItem("bookingDate");
          sessionStorage.removeItem("bookingSeats");
          
          // Redirect to success page
          setTimeout(() => {
            navigate(`/booking/success/${response.data.data._id}`, { replace: true });
          }, 2000);
        } else {
          throw new Error(response.data.message || "Server verification failed.");
        }
      } catch (error) {
        console.error("Khalti verification error:", error);
        setVerificationStatus("failed");
        showToast(error.response?.data?.message || t("Payment verification failed.", "Payment verification failed."), "error");
        setTimeout(() => navigate("/payment/failure", { replace: true }), 3000);
      }
    };

    verifyKhaltiPayment();
  }, [location, navigate, showToast, t]);

  const renderStatus = () => {
    switch (verificationStatus) {
      case "success":
        return (
          <>
            <FaCheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2">{t("Payment Successful!", "Payment Successful!")}</h2>
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              {t("Redirecting to your ticket...", "Redirecting to your ticket...")}
            </p>
          </>
        );
      case "failed":
        return (
          <>
            <FaTimesCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2">{t("Payment Failed", "Payment Failed")}</h2>
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              {t("There was an issue with the payment.", "There was an issue with the payment.")}
            </p>
          </>
        );
      default: 
        return (
          <>
            <FaSpinner className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-spin" />
            <h2 className="text-2xl font-bold mb-2">{t("Verifying Payment...", "Verifying Payment...")}</h2>
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
              {t("Please wait, do not close this window.", "Please wait, do not close this window.")}
            </p>
          </>
        );
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className={`max-w-md w-full p-8 rounded-xl shadow-xl text-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        {renderStatus()}
      </div>
    </div>
  );
}

export default KhaltiCallbackPage;