import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useRef, useState } from "react";
import { useEffect } from "react";
import api from "../services/api";
import { FaCheckCircle, FaSpinner, FaTimesCircle } from "react-icons/fa";

function PaymentCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  const [verificationStatus, setVerificationStatus] = useState("processing");
  const hasVerified = useRef(false);
  const isVerifying = useRef(false);

  useEffect(() => {
    if (hasVerified.current || isVerifying.current) {
      return;
    }

    const verifyEsewaPayment = async () => {
      if (isVerifying.current) return;
      isVerifying.current = true;

      const urlParams = new URLSearchParams(location.search);
      const base64Data = urlParams.get("data");

      if (!base64Data) {
        setVerificationStatus("failed");
        showToast(
          t("भुक्तानी डेटा फेला परेन।", "Payment data not found in URL."),
          "error"
        );
        return;
      }

      try {
        const decodedString = atob(base64Data);
        const decodedData = JSON.parse(decodedString);

        if (!decodedData.transaction_uuid) {
          throw new Error("Transaction UUID not found in decoded data.");
        }
        console.log(
          "Verifying eSewa payment with UUID:",
          decodedData.transaction_uuid
        );
        const response = await api.post("/bookings/verify-esewa", {
          transaction_uuid: decodedData.transaction_uuid,
        });

        if (response.data.success) {
          setVerificationStatus("success");
          showToast(t("भुक्तानी सफल भयो!", "Payment successful!"), "success");
          hasVerified.current = true;

          sessionStorage.removeItem("bookingStep");
          sessionStorage.removeItem("bookingShowtime");
          sessionStorage.removeItem("bookingDate");
          sessionStorage.removeItem("bookingSeats");
          sessionStorage.removeItem("bookingSeatLock");

          setTimeout(() => {
            navigate(`/booking/success/${response.data.data._id}`, {
              replace: true,
              state: { bookingDetails: response.data.data },
            });
          }, 2000);
        } else {
          throw new Error(
            response.data.message || "Verification failed on server."
          );
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setVerificationStatus("failed");
        hasVerified.current = true;

        const errorMessage = error.response?.data?.message || error.message;
        if (!errorMessage.includes("already confirmed")) {
          showToast(
            errorMessage ||
              t(
                "भुक्तानी प्रमाणीकरण असफल भयो।",
                "Payment verification failed."
              ),
            "error"
          );
        }

        setTimeout(() => {
          navigate("/payment/failure", { replace: true });
        }, 3000);
      } finally {
        isVerifying.current = false;
      }
    };

    if (user) {
      verifyEsewaPayment();
    } else {
      navigate("/");
      showToast("Login before doing any payment", info);
    }
  }, [location, user, navigate, showToast, t]);
  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div
        className={`max-w-md w-full p-8 rounded-xl shadow-xl text-center ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {verificationStatus === "processing" && (
          <>
            <FaSpinner className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-spin" />
            <h2 className="text-2xl font-bold mb-2">
              {t("भुक्तानी प्रमाणीकरण गर्दै...", "Verifying Payment...")}
            </h2>
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {t("कृपया पर्खनुहोस्।", "Please wait.")}
            </p>
          </>
        )}

        {verificationStatus === "success" && (
          <>
            <FaCheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2">
              {t("भुक्तानी सफल!", "Payment Successful!")}
            </h2>
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {t(
                "तपाईंको बुकिंग पुष्टि भएको छ।",
                "Your booking has been confirmed."
              )}
            </p>
          </>
        )}

        {verificationStatus === "failed" && (
          <>
            <FaTimesCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2">
              {t("भुक्तानी असफल", "Payment Failed")}
            </h2>
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {t(
                "तपाईंको भुक्तानी प्रशोधन गर्न सकिएन।",
                "We couldn't process your payment."
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentCallbackPage;
