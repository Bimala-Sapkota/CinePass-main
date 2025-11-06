import express from "express";
import { authorize, protect } from "../middleware/auth.js";
import {
  cancelBooking,
  downloadTicket,
  getAllBookings,
  getBookingById,
  getMyBookings,
  initiateEsewaPayment,
  initiateKhaltiPayment,
  lockSeats,
  releaseLock,
  resendBookingEmail,
  verifyEsewaPayment,
  verifyKhaltiPayment,
} from "../controllers/booking.controller.js";

const router = express.Router();

//user must be logged in to access any of the booking routes
router.use(protect);

router.get("/", authorize("admin"), getAllBookings);
router.get("/my-bookings", getMyBookings);

router.post("/lock-seats", lockSeats);
router.post("/release-lock", releaseLock);
router.post("/initiate-khalti", initiateKhaltiPayment);
router.post("/verify-khalti", verifyKhaltiPayment);
router.post("/initiate-esewa", initiateEsewaPayment);
router.post("/verify-esewa", verifyEsewaPayment);

router.get("/:id", protect, getBookingById);
router.post("/:id/resend-email", resendBookingEmail);
router.get("/:id/ticket", downloadTicket);
router.post("/:id/cancel", cancelBooking);

export default router;
