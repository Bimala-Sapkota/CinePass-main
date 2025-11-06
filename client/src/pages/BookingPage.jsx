import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import Step1_DateTimeSelection from "../components/Booking/Step1_DateTimeSelection";
import Step2_SeatSelection from "../components/Booking/Step2_SeatSelection";
import Step3_PaymentAndReview from "../components/Booking/Step3_PaymentAndReview";
import BookingProgress from "./../components/Booking/BookingProgress";
import BookingHeader from "./../components/Booking/BookingHeader";
import LockTimer from "../components/Booking/LockTimer";

const YOUR_SERVICE_FEE_PER_TICKET = 0;
const YOUR_TAX_RATE = 0;
const MAX_SEATS_PER_BOOKING = 10;

const getDates = (numberOfDays = 7, language = "en") => {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < numberOfDays; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const formattedFullDate = `${year}-${month}-${day}`;

    let dayName;
    if (language === "np") {
      const nepaliDays = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];
      dayName = nepaliDays[currentDate.getDay()];
    } else {
      dayName = currentDate.toLocaleDateString("en-US", { weekday: "short" });
    }

    const dayNumber = currentDate.getDate();
    const isCurrentCalendarToday = i === 0;

    dates.push({
      fullDate: formattedFullDate,
      day: dayName,
      date: dayNumber,
      isToday: isCurrentCalendarToday,
    });
  }
  return dates;
};

const groupShowtimesByTheater = (showtimes) => {
  const grouped = {};

  showtimes.forEach((show) => {
    const theaterId = show.theater._id;

    if (!grouped[theaterId]) {
      grouped[theaterId] = {
        theater: show.theater,
        showtimes: [show],
      };
    } else {
      grouped[theaterId].showtimes.push(show);
    }
  });
  return Object.values(grouped);
};
function BookingPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const { t, language } = useLanguage();

  const [movie, setMovie] = useState(null);
  const [theatersAndShowtimes, setTheatersAndShowtimes] = useState([]);
  const [isLoadingShowtimes, setIsLoadingShowtimes] = useState(false);
  const [seatMapData, setSeatMapData] = useState(null);
  const [isLoadingSeatMap, setIsLoadingSeatMap] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  const [datesForSelection, setDatesForSelection] = useState([]);
  const [appliedPromo, setAppliedPromo] = useState(null);

  const [currentStep, setCurrentStep] = useState(
    () => Number(sessionStorage.getItem("bookingStep")) || 1
  );
  const [selectedShowtime, setSelectedShowtime] = useState(
    () => JSON.parse(sessionStorage.getItem("bookingShowtime")) || null
  );
  const [selectedDate, setSelectedDate] = useState(
    () => sessionStorage.getItem("bookingDate") || null
  );
  const [selectedSeats, setSelectedSeats] = useState(
    () => JSON.parse(sessionStorage.getItem("bookingSeats")) || []
  );
  const [seatLockDetails, setSeatLockDetails] = useState(
    () => JSON.parse(sessionStorage.getItem("bookingSeatLock")) || null
  );

  useEffect(() => {
    sessionStorage.setItem("bookingStep", currentStep);
  }, [currentStep]);

  useEffect(() => {
    if (selectedShowtime) {
      sessionStorage.setItem(
        "bookingShowtime",
        JSON.stringify(selectedShowtime)
      );
    } else {
      sessionStorage.removeItem("bookingShowtime");
    }
  }, [selectedShowtime]);

  useEffect(() => {
    if (selectedDate) {
      sessionStorage.setItem("bookingDate", selectedDate);
    } else {
      sessionStorage.removeItem("bookingDate");
    }
  }, [selectedDate]);

  useEffect(() => {
    sessionStorage.setItem("bookingSeats", JSON.stringify(selectedSeats));
  }, [selectedSeats]);

  useEffect(() => {
    if (seatLockDetails) {
      sessionStorage.setItem(
        "bookingSeatLock",
        JSON.stringify(seatLockDetails)
      );
    } else {
      sessionStorage.removeItem("bookingSeatLock");
    }
  }, [seatLockDetails]);

  useEffect(() => {
    const dates = getDates(7, language);
    setDatesForSelection(dates);

    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0].fullDate);
    }
  }, [language, selectedDate]);

  const handlePromoApplied = (promoData) => {
    setAppliedPromo(promoData);
  };

  const orderSummaryDetails = useMemo(() => {
    if (
      !selectedShowtime ||
      selectedSeats.length === 0 ||
      !seatMapData?.seats
    ) {
      return {
        subtotal: 0,
        serviceFee: 0,
        taxes: 0,
        finalTotal: 0,
        currency: "NRs",
        numberOfTickets: 0,
      };
    }
    const numberOfTickets = selectedSeats.length;
    let subtotal = 0;

    const seatDetailsMap = new Map(
      seatMapData.seats.map((s) => [s.seatName, s])
    );

    selectedSeats.forEach((seatId) => {
      const seatInfo = seatDetailsMap.get(seatId);
      const isPremium = seatInfo?.type === "premium";

      if (isPremium && selectedShowtime.ticketPrice.premium) {
        subtotal += selectedShowtime.ticketPrice.premium;
      } else if (selectedShowtime.ticketPrice.standard) {
        subtotal += selectedShowtime.ticketPrice.standard;
      } else if (typeof selectedShowtime.ticketPrice === "number") {
        subtotal += selectedShowtime.ticketPrice;
      }
    });

    const serviceFee = numberOfTickets * YOUR_SERVICE_FEE_PER_TICKET;
    const taxes = subtotal * YOUR_TAX_RATE;

    let discount = 0;
    if (appliedPromo) {
      if (appliedPromo.discountType === "percentage") {
        discount = subtotal * (appliedPromo.discountValue / 100);
      } else {
        discount = appliedPromo.discountValue;
      }
    }
    const finalTotal = subtotal + serviceFee + taxes - discount;

    return {
      subtotal,
      serviceFee,
      taxes,
      discount,
      finalTotal,
      currency: "NRs.",
      numberOfTickets,
    };
  }, [selectedShowtime, selectedSeats, seatMapData, appliedPromo]);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!movieId) return;

      try {
        const response = await api.get(`/movies/${movieId}`);
        setMovie(response.data.data);
      } catch (error) {
        showToast(
          t(
            "चलचित्रको विवरण लोड गर्न त्रुटि भयो।",
            "Error loading movie details."
          ),
          "error"
        );
      }
    };
    fetchMovie();
  }, [movieId]);

  const fetchShowtimesForDate = useCallback(async () => {
    if (!movieId || !selectedDate) return;
    setIsLoadingShowtimes(true);
    try {
      const response = await api.get(
        `/showtimes?movieId=${movieId}&date=${selectedDate}`
      );
      const data = response.data.data || [];
      if (data.length > 0 && data[0].theater) {
        setTheatersAndShowtimes(data);
      } else {
        const grouped = groupShowtimesByTheater(data);
        setTheatersAndShowtimes(grouped);
      }
    } catch (error) {
      showToast(
        t("शो-समयहरू लोड गर्न सकिएन।", "Failed to load showtimes."),
        "error"
      );
      setTheatersAndShowtimes([]);
    } finally {
      setIsLoadingShowtimes(false);
    }
  }, [movieId, selectedDate, showToast, t]);

  useEffect(() => {
    fetchShowtimesForDate();
  }, [fetchShowtimesForDate]);

  const fetchSeatMap = useCallback(async () => {
    if (!selectedShowtime || !selectedShowtime._id) {
      setSeatMapData(null);
      setSelectedSeats([]);
      return;
    }
    setIsLoadingSeatMap(true);
    try {
      const response = await api.get(
        `/showtimes/${selectedShowtime._id}/seats`
      );
      setSeatMapData(response.data.data);
      setSelectedSeats([]);
    } catch (error) {
      console.error("Seat map error:", error.response);
      showToast(
        t("सिट नक्सा लोड गर्न सकिएन।", "Failed to load seat map."),
        "error"
      );
      setSeatMapData(null);
    } finally {
      setIsLoadingSeatMap(false);
    }
  }, [selectedShowtime, showToast, t]);

  useEffect(() => {
    fetchSeatMap();
  }, [fetchSeatMap]);

  const clearBookingSession = useCallback(() => {
    sessionStorage.removeItem("bookingStep");
    sessionStorage.removeItem("bookingShowtime");
    sessionStorage.removeItem("bookingDate");
    sessionStorage.removeItem("bookingSeats");
    sessionStorage.removeItem("bookingSeatLock");

    setCurrentStep(1);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setSeatLockDetails(null);
    setSeatMapData(null);
  }, []);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const restart = urlParams.get("restart");

    if (restart === "true") {
      clearBookingSession();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [clearBookingSession]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      clearBookingSession();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTimeout(() => {
          if (document.hidden) {
            clearBookingSession();
          }
        }, 30000);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearBookingSession]);

  useEffect(() => {
    const checkStaleSession = () => {
      const storedLockDetails = JSON.parse(
        sessionStorage.getItem("bookingSeatLock")
      );
      if (storedLockDetails && storedLockDetails.lockExpires) {
        const now = new Date().getTime();
        const expires = new Date(storedLockDetails.lockExpires).getTime();

        if (now > expires) {
          clearBookingSession();
          showToast(
            t(
              "आपका सिट लक समाप्त हो गया है। कृपया फिर से बुकिंग शुरू करें।",
              "Your seat lock has expired. Please start booking again."
            ),
            "warning"
          );
        }
      }
    };

    checkStaleSession();
  }, [clearBookingSession, showToast, t]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedShowtime(null);
    setSeatMapData(null);
    setSelectedSeats([]);
    setSeatLockDetails(null);
  };
  const handleShowtimeSelect = (showtimeObj) =>
    setSelectedShowtime(showtimeObj);

  const areSeatsAlreadyLockedByUser = (seatsToCheck) => {
    if (!seatLockDetails || seatsToCheck.length === 0) return false;

    const sortedSeatsToCheck = [...seatsToCheck].sort();
    const sortedLockedSeats = [...seatLockDetails.lockedSeats].sort();

    return (
      JSON.stringify(sortedSeatsToCheck) === JSON.stringify(sortedLockedSeats)
    );
  };

  const handleSeatSelect = (seatId) => {
    const seatDetail = seatMapData?.seats?.find((s) => s.seatName === seatId);
    if (!seatDetail) {
      showToast(
        t("Invalid seat selected.", "Invalid seat selected."),
        "warning"
      );
      return;
    }

    const isSelectable =
      seatDetail.status === "available" ||
      (seatDetail.status === "locked" && seatDetail.lockedByCurrentUser);

    if (!isSelectable) {
      showToast(
        t("यो सिट उपलब्ध छैन।", "This seat is not available."),
        "warning"
      );
      return;
    }

    setSelectedSeats((prevSeats) => {
      if (prevSeats.includes(seatId)) {
        return prevSeats.filter((s) => s !== seatId);
      } else {
        if (prevSeats.length < MAX_SEATS_PER_BOOKING) {
          return [...prevSeats, seatId];
        }
        showToast(
          t(
            `तपाईंले बढीमा ${MAX_SEATS_PER_BOOKING} सिटहरू चयन गर्न सक्नुहुन्छ।`,
            `You can select a maximum of ${MAX_SEATS_PER_BOOKING} seats.`
          ),
          "warning"
        );
        return prevSeats;
      }
    });
  };

  const handlePaymentMethodSelect = (methodId) =>
    setSelectedPaymentMethod(methodId);

  const nextStep = async () => {
    if (currentStep === 1) {
      if (!selectedShowtime) {
        showToast(
          t("कृपया शो टाइम चयन गर्नुहोस्।", "Please select a showtime."),
          "warning"
        );
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (selectedSeats.length === 0) {
        showToast(
          t(
            "कृपया कम्तिमा एक सिट चयन गर्नुहोस्।",
            "Please select at least one seat."
          ),
          "warning"
        );
        return;
      }

      if (areSeatsAlreadyLockedByUser(selectedSeats)) {
        setCurrentStep(3);
        window.scrollTo(0, 0);
        return;
      }

      try {
        const response = await api.post("/bookings/lock-seats", {
          showtimeId: selectedShowtime._id,
          seats: selectedSeats,
        });

        if (response.data.data.lockExpires) {
          setSeatLockDetails({
            lockExpires: response.data.data.lockExpires,
            lockedSeats: selectedSeats,
          });
        }
        setCurrentStep(3);
      } catch (error) {
        console.error("Failed to lock seats:", error);
        // showToast(t("सिट लक गर्न सकिएन।", "Failed to lock seats."), "error");
        let errorMessage = "Failed to lock seats. Please try again.";

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message === "Network Error") {
          errorMessage =
            "Server connection lost. Please refresh and try again.";
        }
        showToast(t("", errorMessage), "error");
        return;
      }
    }
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    if (currentStep > 1) {
      if (currentStep === 3 && seatLockDetails) {
        try {
          api.post("/bookings/release-lock", {
            showtimeId: selectedShowtime._id,
            seats: seatLockDetails.lockedSeats,
          });
        } catch (error) {
          console.error("Failed to release lock on back step:", error);
        }
        setSeatLockDetails(null);
      }
      setCurrentStep(currentStep - 1);
    }
    window.scrollTo(0, 0);
  };

  const handleInitiatePaymentAndConfirm = async () => {
    if (!user) {
      showToast(
        t(
          "टिकट बुक गर्न कृपया लगइन गर्नुहोस्।",
          "Please login to book tickets."
        ),
        "error"
      );
      window.dispatchEvent(new CustomEvent("unauthorized"));
      return;
    }
    if (!selectedPaymentMethod) {
      showToast(
        t(
          "कृपया भुक्तानी विधि चयन गर्नुहोस्।",
          "Please select a payment method."
        ),
        "error"
      );
      return;
    }

    setIsProcessingBooking(true);

    try {
      let response;

      if (selectedPaymentMethod === "esewa") {
        response = await api.post("/bookings/initiate-esewa", {
          showtimeId: selectedShowtime._id,
          seats: selectedSeats,
          promoCode: appliedPromo ? appliedPromo.promoCode : undefined,
        });

        if (response.data.data.lockExpires) {
          setSeatLockDetails({
            lockExpires: response.data.data.lockExpires,
            lockedSeats: selectedSeats,
          });
        }

        if (response.data.data.formData && response.data.data.esewa_url) {
          const form = document.createElement("form");
          form.method = "Post";
          form.action = response.data.data.esewa_url;

          Object.keys(response.data.data.formData).forEach((key) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = response.data.data.formData[key];
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
        }
      } else if (selectedPaymentMethod === "khalti") {
        console.log(
          "Inside Khalti block. Showtime:",
          selectedShowtime,
          "Seats:",
          selectedSeats
        );
        if (
          !selectedShowtime ||
          !selectedShowtime._id ||
          !selectedSeats ||
          selectedSeats.length === 0
        ) {
          console.error("Cannot proceed: Showtime or Seats are invalid.");
          showToast(
            t(
              "Booking details are incomplete. Please go back and select your showtime and seats again.",
              "Booking details are incomplete. Please go back and select your showtime and seats again."
            ),
            "error"
          );
          setIsProcessingBooking(false);
          return;
        }
        response = await api.post("/bookings/initiate-khalti", {
          showtimeId: selectedShowtime._id,
          seats: selectedSeats,
          promoCode: appliedPromo ? appliedPromo.promoCode : undefined,
        });
        console.log(
          "Received API response from /initiate-khalti:",
          response.data
        );

        if (response.data.data.lockExpires) {
          setSeatLockDetails({
            lockExpires: response.data.data.lockExpires,
            lockedSeats: selectedSeats,
          });
        }

        if (response.data.data.payment_url) {
          window.location.href = response.data.data.payment_url;
        } else {
          throw new Error("Khalti payment URL not received.");
        }
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      showToast(
        error.response?.data?.message ||
          t("भुक्तानी शुरू गर्न सकिएन।", "Failed to initiate payment."),
        "error"
      );
      if (error.response?.status === 409) {
        setCurrentStep(2);
        setSelectedSeats([]);
        fetchSeatMap();
      }
      if (error.response?.status === 403) {
        setCurrentStep(2);
        setSelectedSeats([]);
        fetchSeatMap();
      }
    } finally {
      setIsProcessingBooking(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        if (datesForSelection.length === 0) {
          return (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          );
        }
        return (
          <Step1_DateTimeSelection
            dates={datesForSelection}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            theatersAndShowtimes={theatersAndShowtimes}
            selectedShowtime={selectedShowtime}
            onShowtimeSelect={handleShowtimeSelect}
            onNextStep={nextStep}
            isLoadingShowtimes={isLoadingShowtimes}
            movieTitle={movie?.title}
          />
        );
      case 2:
        return (
          <Step2_SeatSelection
            seatMapData={seatMapData}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
            maxSeatsToSelect={MAX_SEATS_PER_BOOKING}
            onNextStep={nextStep}
            onPrevStep={prevStep}
            isLoadingSeatMap={isLoadingSeatMap}
            isProcessingLock={isProcessingBooking}
            selectedShowtime={selectedShowtime}
            movie={movie}
          />
        );
      case 3:
        return (
          <Step3_PaymentAndReview
            movie={movie}
            selectedShowtime={selectedShowtime}
            selectedSeats={selectedSeats}
            orderSummaryDetails={orderSummaryDetails}
            onPromoApplied={handlePromoApplied}
            appliedPromo={appliedPromo}
            paymentMethods={[
              {
                id: "esewa",
                name: "eSewa",
                logoUrl:
                  "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fe7.pngegg.com%2Fpngimages%2F18%2F669%2Fpng-clipart-esewa-fonepay-pvt-ltd-logo-brand-cash-on-delivery-logo-text-logo.png&f=1&nofb=1&ipt=82ffde2560b4b36456fb0d2aaff6d4090926924ee0620114ec71a38a38ce9619",
                icon: "fa-wallet",
              },
              {
                id: "khalti",
                name: "khalti",
                logoUrl:
                  "https://khaltibyime.khalti.com/wp-content/uploads/2025/07/Logo-for-Blog.png",
                icon: "fa-money-bill-wave",
              },
            ]}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            onPrevStep={prevStep}
            onInitiatePaymentAndConfirm={handleInitiatePaymentAndConfirm}
            isProcessingBooking={isProcessingBooking}
          />
        );
      default:
        return null;
    }
  };

  if (!movie)
    return (
      <div className="container mx-auto p-8 text-center flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <main className="container mx-auto px-2 sm:px-4 py-6 md:py-8 min-h-[calc(100vh-200px)] animate-fade-in">
        <BookingHeader movie={movie} />
        <BookingProgress currentStep={currentStep} totalSteps={3} />

        {seatLockDetails && (currentStep === 2 || currentStep === 3) && (
          <LockTimer
            lockExpires={seatLockDetails.lockExpires}
            onExpired={() => {
              clearBookingSession();
              showToast(
                t(
                  "सिट लक समाप्त हो गया। कृपया फिर से शुरू करें।",
                  "Seat lock expired. Please start again."
                ),
                "warning"
              );
            }}
          />
        )}
        <div className="mt-6 md:mt-8">{renderStepContent()}</div>
      </main>
    </div>
  );
}

export default BookingPage;
