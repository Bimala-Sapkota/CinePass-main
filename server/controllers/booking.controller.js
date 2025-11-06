import asyncHandler from "../middleware/asyncHandler.js";
import { Showtime } from "../models/Showtime.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Booking } from "../models/Booking.model.js";
import { History } from "../models/History.model.js";
import mongoose from "mongoose";
import {
  sendBookingCancellationEmail,
  sendBookingConfirmationEmail,
  sendManualRefundAlertEmail,
} from "../utils/email.util.js";
import axios from "axios";
import {
  checkEsewaTransactionStatus,
  generateEsewaSignature,
} from "../utils/esewa.util.js";
import {
  bookSeatsForShowtime,
  lockSeatsForShowtime,
  releaseBookedSeatsForShowtime,
  releaseSeatsForShowtime,
} from "../utils/showtime.util.js";
import { Movie } from "./../models/Movie.model.js";
import { initiateKhaltiRefund } from "../utils/khalti.util.js";
import { Offer } from "../models/Offer.model.js";

const LOCK_TIMEOUT_MINUTES = 5;
const CANCELLATION_WINDOW_HOURS = 2;

// POST /api/bookings/lock-seats PRIVATE
export const lockSeats = asyncHandler(async (req, res) => {
  const { showtimeId, seats } = req.body;
  const userId = req.user.id;

  if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
    throw new ApiError(
      400,
      "Showtime ID and a non-empty array of seats are required."
    );
  }

  if (!mongoose.Types.ObjectId.isValid(showtimeId)) {
    throw new ApiError(400, "Invalid showtime ID format");
  }

  const showtime = await Showtime.findById(showtimeId);
  if (!showtime) {
    throw new ApiError(404, "Showtime not found");
  }

  let session;
  try {
    session = await mongoose.startSession();
    let lockExpires;
    await session.withTransaction(async (session) => {
      lockExpires = await lockSeatsForShowtime(
        showtimeId,
        seats,
        userId,
        session
      );

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { lockExpires, message: "Seats locked successfully" },
            "Seats locked for booking"
          )
        );
    });
  } catch (error) {
    console.error("Lock seats transaction failed:", error);

    if (error instanceof ApiError) {
      throw error;
    } else {
      throw new ApiError(500, "Could not lock seats. Please try again.");
    }
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

// POST /api/bookings/release-lock PRIVATE
export const releaseLock = asyncHandler(async (req, res) => {
  const { showtimeId, seats } = req.body;
  const userId = req.user.id;
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async (session) => {
      await releaseSeatsForShowtime(showtimeId, seats, userId, session);
    });
    res.status(200).json(new ApiResponse(200, null, "Lock released"));
  } catch (error) {
    console.error("Release lock transaction failed after retries:", error);
    throw new ApiError(500, "Could not release lock.");
  } finally {
    await session.endSession();
  }
});
//  GET /api/bookings/my-bookings PRIVATE
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate({
      path: "showtime",
      populate: [
        { path: "movie", select: "title posterImage" },
        { path: "theater", select: "name location" },
      ],
    })
    .sort({ createdAt: -1 });
  const validBookings = bookings.filter((booking) => booking.showtime);

  if (!bookings) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No bookings found for this user."));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, validBookings, "User bookings fetched successfully.")
    );
});

//  GET /api/bookings PRIVATE
export const getAllBookings = asyncHandler(async (req, res) => {
  const allbookings = await Booking.find({})
    .populate("user", "username email")
    .populate({
      path: "showtime",
      populate: { path: "movie", select: "title" },
    })
    .sort({ createdAt: -1 });

  const validBookings = allbookings.filter(
    (booking) => booking.showtime !== null
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, validBookings, "All bookings fetched successfully.")
    );
});

// GET /api/bookings/:id PRIVATE[Admin]
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate({
    path: "showtime",
    populate: [
      { path: "movie", select: "title titleNepali posterImage" },
      { path: "theater", select: "name location" },
    ],
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized to view this booking.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking fetched successfully."));
});

//   POST /api/bookings/initiate-khalti PRIVATE
export const initiateKhaltiPayment = asyncHandler(async (req, res) => {
  // Algo: Initial Payment
  // 1. Lock seats
  // 2. Calculate Total Price
  // 3. Create a PENDING booking record in our DB
  // 4. Prepare payload for Khalti
  // 5. Call Khalti Initiate API
  // 6. Update our booking with Khalti's pidx
  // 7. Send payment URL back to the frontend
  const { showtimeId, seats, promoCode } = req.body;
  const userId = req.user.id;

  if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
    throw new ApiError(
      400,
      "Showtime ID and a non-empty array of seats are required."
    );
  }

  const showtime = await Showtime.findById(showtimeId).populate("movie");
  if (!showtime) throw new ApiError(404, "Showtime not found");
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const seatsAlreadyLocked = seats.every((seatName) => {
      const seat = showtime.seatAvailability.find(
        (s) => s.seatName === seatName
      );
      return (
        seat &&
        seat.status === "locked" &&
        seat.user &&
        seat.user.toString() === userId
      );
    });

    let lockExpires;
    if (seatsAlreadyLocked) {
      // Use existing lock expiry
      const firstSeat = showtime.seatAvailability.find(
        (s) => s.seatName === seats[0]
      );
      lockExpires = firstSeat.lockedUntil;
      console.log("Using existing seat locks for Khalti payment");
    } else {
      // Lock seats if not already locked
      lockExpires = await lockSeatsForShowtime(
        showtimeId,
        seats,
        userId,
        session
      );
      console.log("Created new seat locks for Khalti payment");
    }
    let { totalPrice } = await calculateFinalPrice(showtime, seats, promoCode);
    // const seatDetailMap = new Map(
    //   showtime.seatAvailability.map((s) => [s.seatName, s])
    // );
    // seats.forEach((seatName) => {
    //   const seatDetail = seatDetailMap.get(seatName);
    //   if (!seatDetail)
    //     throw new ApiError(400, `Invalid seat ${seatName} for this showtime.`);
    //   totalPrice +=
    //     seatDetail.type === "premium"
    //       ? showtime.ticketPrice.premium
    //       : showtime.ticketPrice.standard;
    // });

    const pendingBookingArray = await Booking.create(
      [
        {
          user: userId,
          showtime: showtimeId,
          seats: seats,
          totalPrice: totalPrice,
          paymentMethod: "khalti",
          paymentStatus: "Pending",
          status: "Pending",
        },
      ],
      { session }
    );

    const booking = pendingBookingArray[0];
    const bookingId = booking._id;

    const khaltiPayload = {
      return_url: `${process.env.APP_BASE_URL}/payment/success/Khalti`,
      website_url: process.env.APP_BASE_URL,
      amount: totalPrice * 100,
      purchase_order_id: bookingId.toString(),
      purchase_order_name: `CinePass: ${showtime.movie.title} - ${seats.length} Tickets`,
      customer_info: {
        name: req.user.username,
        email: req.user.email,
        phone: req.user.phone,
      },
    };

    const khaltiResponse = await axios.post(
      process.env.KHALTI_BASE_URL,
      khaltiPayload,
      { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
    );

    booking.paymentId = khaltiResponse.data.pidx;
    await booking.save({ session });

    await session.commitTransaction();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          payment_url: khaltiResponse.data.payment_url,
          lockExpires: lockExpires,
        },
        "Payment initiated. Redirecting to khalti."
      )
    );
  } catch (error) {
    await session.abortTransaction();
    console.error(
      "Khalti Initiation Failed:",
      error.response ? error.response.data : error.message
    );
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to initiate Khalti payment."
    );
  } finally {
    await session.endSession();
  }
});

//   POST /api/bookings/verify-khalti PRIVATE
export const verifyKhaltiPayment = asyncHandler(async (req, res) => {
  // Algo: Verify payment
  // 1. Call Khalti Lookup API for verification
  // 2. Find the original booking in our DB
  // 3. Verify the transaction
  // 4. Update Booking to 'Completed'
  // 5. Update Showtime seats from 'locked' to 'booked'
  // 6. Add to user history
  // 7. Send confirmation email

  const { pidx, purchase_order_id } = req.body;
  const userId = req.user.id;

  if (!pidx || !purchase_order_id) {
    throw new ApiError(
      400,
      "PIDX and purchase order ID are required for verification."
    );
  }

  const booking = await Booking.findById(purchase_order_id).populate({
    path: "showtime",
    populate: { path: "movie theater" },
  });

  if (!booking) throw new ApiError(404, "Booking not found.");
  if (booking.user.toString() !== userId)
    throw new ApiError(403, "Not authorized for this booking.");
  if (booking.paymentStatus !== "Pending")
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          booking,
          "This booking has already been processed."
        )
      );

  const lookupResponse = await axios.post(
    "https://dev.khalti.com/api/v2/epayment/lookup/",
    { pidx },
    { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
  );
  const { status, total_amount, transaction_id } = lookupResponse.data;

  const isVerified =
    status === "Completed" && total_amount === booking.totalPrice * 100;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!isVerified) {
      booking.paymentStatus =
        status === "User canceled" ? "Cancelled" : "Failed";
      await booking.save({ session });

      await releaseSeatsForShowtime(
        booking.showtime._id,
        booking.seats,
        userId,
        session
      );
      await session.commitTransaction();
      throw new ApiError(400, "Payment verification failed or was cancelled.");
    }

    const updateResult = await Booking.updateOne(
      { _id: booking._id, paymentStatus: "Pending" },
      {
        $set: {
          paymentStatus: "Completed",
          status: "Confirmed",
          paymentId: transaction_id,
        },
      },
      { session }
    );

    if (updateResult.modifiedCount === 0) {
      console.log(
        `[Race Condition] Khalti booking ${booking._id} was already processed.`
      );
      await session.abortTransaction();
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            booking,
            "This booking has already been processed."
          )
        );
    }

    await bookSeatsForShowtime(
      booking.showtime._id,
      booking.seats,
      userId,
      session
    );
    const movie = await Movie.findById(booking.showtime.movie._id).session(
      session
    );
    if (movie) {
      const showtime = await Showtime.findById(booking.showtime._id).session(
        session
      );
      const timeOfDay = new Date(showtime.startTime).toLocaleTimeString(
        "en-US",
        { hour: "2-digit", minute: "2-digit" }
      );
      movie
        .incrementBookingCount(booking.seats.length)
        .updateTotalRevenue(booking.totalPrice)
        .updatePopularShowtimes(timeOfDay);
      await movie.save({ session });
    }

    await History.create(
      [
        {
          userId: userId,
          movieId: booking.showtime.movie._id,
          actionType: "booked",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    const confirmedBooking = await Booking.findById(booking._id)
      .populate("user", "username email")
      .populate({
        path: "showtime",
        populate: [{ path: "movie" }, { path: "theater" }],
      });
    if (!confirmedBooking) {
      throw new ApiError(
        500,
        "Failed to retrieve confirmed booking details for email."
      );
    }

    await sendBookingConfirmationEmail(confirmedBooking);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          confirmedBooking,
          "Booking confirmed successfully!"
        )
      );
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    console.error(
      "Khalti Booking Confirmation/Verification Transaction Failed:",
      error
    );
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Server error during booking verification."
    );
  } finally {
    await session.endSession();
  }
});

//   POST /api/bookings/initiate-esewa PRIVATE
export const initiateEsewaPayment = asyncHandler(async (req, res) => {
  const { showtimeId, seats, promoCode } = req.body;
  const userId = req.user.id;

  if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
    throw new ApiError(
      400,
      "Showtime ID and a non-empty array of seats are required."
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const showtime = await Showtime.findById(showtimeId).session(session);
    if (!showtime) throw new ApiError(404, "Showtime not found");

    const seatsAlreadyLocked = seats.every((seatName) => {
      const seat = showtime.seatAvailability.find(
        (s) => s.seatName === seatName
      );
      return (
        seat &&
        seat.status === "locked" &&
        seat.user &&
        seat.user.toString() === userId
      );
    });

    let lockExpires;
    if (seatsAlreadyLocked) {
      // Use existing lock expiry
      const firstSeat = showtime.seatAvailability.find(
        (s) => s.seatName === seats[0]
      );
      lockExpires = firstSeat.lockedUntil;
      console.log("Using existing seat locks for eSewa payment");
    } else {
      // Lock seats if not already locked
      lockExpires = await lockSeatsForShowtime(
        showtimeId,
        seats,
        userId,
        session
      );
      console.log("Created new seat locks for eSewa payment");
    }

    let { totalPrice } = await calculateFinalPrice(showtime, seats, promoCode);
    const seatDetailsMap = new Map(
      showtime.seatAvailability.map((s) => [s.seatName, s])
    );

    // seats.forEach((seatName) => {
    //   const seatDetail = seatDetailsMap.get(seatName);
    //   if (!seatDetail)
    //     throw new ApiError(400, `Invalid seat ${seatName} for this showtime.`);
    //   totalPrice +=
    //     seatDetail.type === "premium"
    //       ? showtime.ticketPrice.premium
    //       : showtime.ticketPrice.standard;
    // });

    const transaction_uuid = new mongoose.Types.ObjectId().toString();

    const pendingBooking = await Booking.create(
      [
        {
          user: userId,
          showtime: showtimeId,
          seats,
          totalPrice,
          paymentMethod: "esewa",
          paymentStatus: "Pending",
          paymentId: transaction_uuid,
        },
      ],
      { session }
    );

    const bookingId = pendingBooking[0]._id;

    const formattedTotalAmount = totalPrice.toFixed(2);

    const signature = generateEsewaSignature({
      total_amount: formattedTotalAmount,
      transaction_uuid: transaction_uuid,
      product_code: process.env.ESEWA_PRODUCT_CODE,
    });

    const formData = {
      amount: formattedTotalAmount,
      tax_amount: 0,
      total_amount: formattedTotalAmount,
      transaction_uuid: transaction_uuid,
      product_code: process.env.ESEWA_PRODUCT_CODE,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: `${process.env.APP_BASE_URL}/payment/success/esewa`,
      failure_url: `${process.env.APP_BASE_URL}/payment/failure`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: signature,
    };

    await session.commitTransaction();
    await session.endSession();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          formData,
          esewa_url: process.env.ESEWA_FORM_URL,
          bookingId: bookingId.toString(),
          lockExpires: lockExpires,
        },
        "eSewa payment initiated. Proceed to payment."
      )
    );
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("eSewa Initiation Failed:", error);
    throw new ApiError(
      error.statusCode || 500,
      "Failed to initiate eSewa payment."
    );
  } finally {
    if (session.inTransaction()) await session.endSession();
  }
});

//   POST /api/bookings/verify-esewa PRIVATE
export const verifyEsewaPayment = asyncHandler(async (req, res) => {
  //Algo for verifying:
  // Step 1: Get the transaction data from the request.
  // eSewa redirects to the `success_url` with GET query parameters.
  // 'oid' is their name for the 'transaction_uuid' we sent them.
  // Step 2: Find the original 'Pending' booking in our database using the transaction_uuid.
  // We stored our generated UUID in the `paymentId` field during initiation.
  // Step 3: Perform initial validation on the booking itself.
  // Step 4: CORE SECURITY - Verify the transaction by calling eSewa's server-to-server API.
  // This is our single source of truth, ignoring any other data from the client-side redirect.
  // Step 5: Start a database transaction to confirm or fail the booking atomically.
  const { transaction_uuid } = req.body;
  const userId = req.user._id;

  if (!transaction_uuid) {
    throw new ApiError(
      400,
      "Transaction UUID is missing from the request body."
    );
  }

  const booking = await Booking.findOne({
    paymentId: transaction_uuid,
    user: userId,
  }).populate({
    path: "showtime",
    populate: [{ path: "movie" }, { path: "theater" }],
  });

  if (!booking) {
    throw new ApiError(404, "Booking for this transaction not found.");
  }

  if (booking.status === "Confirmed") {
    console.log(
      `[Idempotency] Booking ${booking._id} already confirmed. Returning success.`
    );
    return res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking was already confirmed."));
  }

  if (booking.paymentStatus !== "Pending") {
    throw new ApiError(
      409,
      `Booking is not in a pending state. Current status: ${booking.paymentStatus}`
    );
  }

  const statusCheckResult = await checkEsewaTransactionStatus(
    transaction_uuid,
    booking.totalPrice
  );
  const isVerified =
    statusCheckResult.status === "COMPLETE" &&
    parseFloat(statusCheckResult.total_amount) === booking.totalPrice;

  const maxRetries = 3;
  let retryCount = 0;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!isVerified) {
      await Booking.updateOne(
        { _id: booking._id },
        { $set: { paymentStatus: "Failed" } },
        { session }
      );
      await releaseSeatsForShowtime(
        booking.showtime,
        booking.seats,
        userId.toString(),
        session
      );
      await session.commitTransaction();
      throw new ApiError(
        400,
        `Payment verification failed. eSewa status: ${statusCheckResult.status}`
      );
    }

    const updateResult = await Booking.updateOne(
      { _id: booking._id, paymentStatus: "Pending" },
      {
        $set: {
          paymentStatus: "Completed",
          status: "Confirmed",
          paymentId: statusCheckResult.ref_id || transaction_uuid,
        },
      },
      { session, new: true, runValidators: true }
    );

    if (updateResult.modifiedCount === 0) {
      console.log(
        `[Race Condition] Booking ${booking._id} was modified by another process. Aborting.`
      );
      await session.abortTransaction();
      const finalBooking = await Booking.findById(booking._id).populate({
        path: "showtime",
        populate: [{ path: "movie" }, { path: "theater" }],
      });

      return res
        .status(200)
        .json(
          new ApiResponse(200, finalBooking, "Booking confirmed successfully.")
        );
    }

    await bookSeatsForShowtime(
      booking.showtime,
      booking.seats,
      userId.toString(),
      session
    );

    const movie = await Movie.findById(booking.showtime.movie._id).session(
      session
    );
    if (movie) {
      const showtime = await Showtime.findById(booking.showtime._id).session(
        session
      );
      const timeOfDay = new Date(showtime.startTime).toLocaleTimeString(
        "en-US",
        { hour: "2-digit", minute: "2-digit" }
      );
      movie
        .incrementBookingCount(booking.seats.length)
        .updateTotalRevenue(booking.totalPrice)
        .updatePopularShowtimes(timeOfDay);
      await movie.save({ session });
    }

    const showtimeDoc = await Showtime.findById(booking.showtime._id)
      .select("movie")
      .session(session);

    await History.create(
      [
        {
          userId: userId,
          movieId: showtimeDoc.movie,
          actionType: "booked",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    const confirmedBooking = await Booking.findById(booking._id)
      .populate("user", "username email")
      .populate({
        path: "showtime",
        populate: [{ path: "movie" }, { path: "theater" }],
      });

    if (!confirmedBooking) {
      throw new ApiError(
        500,
        "Failed to retrieve confirmed booking details for email."
      );
    }

    console.log(`Booking ${booking._id} confirmed successfully.`);

    // Re-populate the original booking object with fresh data for the email and response
    const finalBookingData = await booking.populate({
      path: "showtime",
      populate: [{ path: "movie" }, { path: "theater" }],
    });

    await sendBookingConfirmationEmail(confirmedBooking);

    const updatedShowtime = await Showtime.findById(booking.showtime._id);
    if (updatedShowtime) {
      const hasRemainingLocks = updatedShowtime.seatAvailability.some(
        (s) => s.status === "locked"
      );
      if (!hasRemainingLocks) {
        await Showtime.updateOne(
          { _id: updatedShowtime._id },
          { $set: { hasLockedSeats: false } }
        );
      }
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          confirmedBooking,
          "Booking confirmed successfully via eSewa!"
        )
      );
    return;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("eSewa Booking Confirmation Transaction Failed:", error);
    throw error; // Let global error handler create and send the 500 response
  } finally {
    await session.endSession();
  }
});

// POST /api/bookings/:id/cancel PRIVATE
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate({
      path: "showtime",
      populate: {
        path: "movie",
        select: "title",
      },
    })
    .populate("user", "username email");

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }
  if (
    booking.user._id.toString() !== req.user.id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "You are not authorized to cancel this booking.");
  }
  if (booking.status !== "Confirmed") {
    throw new ApiError(
      400,
      `This booking cannot be cancelled (Status: ${booking.status}).`
    );
  }

  const showtimeDate = new Date(booking.showtime.startTime);
  const cancellationDeadline = new Date(
    showtimeDate.getTime() - CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000
  );
  if (new Date() > cancellationDeadline && req.user.role !== "admin") {
    throw new ApiError(
      400,
      `Cancellation window has closed. Bookings can only be cancelled up to ${CANCELLATION_WINDOW_HOURS} hours before showtime.`
    );
  }

  let refundResult = { success: false };
  let finalPaymentStatus = "Cancelled";
  let responseMessage = "Booking cancelled successfully.";

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (booking.paymentMethod === "khalti") {
      refundResult = await initiateKhaltiRefund(booking.paymentId);
      if (!refundResult.success) {
        throw new ApiError(
          502,
          refundResult.message || "Khalti refund process failed."
        );
      }
      finalPaymentStatus = "Refunded";
      responseMessage = "Booking cancelled and refund processed successfully.";
    } else if (booking.paymentMethod === "esewa") {
      finalPaymentStatus = "Refund-Pending-Manual";
      responseMessage =
        "Booking cancelled. Your refund will be processed manually within 2-3 business days.";

      refundResult.success = true;
    }

    booking.status = "Cancelled";
    booking.paymentStatus = finalPaymentStatus;
    await booking.save({ session });

    await releaseBookedSeatsForShowtime(
      booking.showtime._id,
      booking.seats,
      session
    );

    await Movie.updateOne(
      { _id: booking.showtime.movie },
      { $inc: { bookingCount: -booking.seats.length } },
      { session }
    );
    await session.commitTransaction();

    if (booking.paymentMethod === "esewa") {
      await sendManualRefundAlertEmail(booking);
    }
    await sendBookingCancellationEmail(booking, responseMessage);

    res.status(200).json(new ApiResponse(200, booking, responseMessage));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

// POST /api/bookings/:id/resend-email
export const resendBookingEmail = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate({
    path: "showtime",
    populate: [{ path: "movie" }, { path: "theater" }],
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  if (booking.user.toString() !== req.user.id.toString()) {
    throw new ApiError(403, "Not authorized to access this booking.");
  }

  await sendBookingConfirmationEmail(booking);

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Confirmation email has been resent."));
});

export const downloadTicket = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate({
    path: "showtime",
    populate: [{ path: "movie" }, { path: "theater" }],
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  if (booking.user.toString() !== req.user.id.toString()) {
    throw new ApiError(403, "Not authorized to access this booking.");
  }

  const { movie, theater, startTime, screen } = booking.showtime;

  const ticketHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CinePass Ticket - ${booking.bookingReference}</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f9; display: flex; justify-content: center; align-items: center; }
              .ticket { background-color: white; border: 1px dashed #ccc; padding: 25px; width: 350px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
              .header { text-align: center; border-bottom: 2px solid #6d28d9; padding-bottom: 15px; margin-bottom: 20px; }
              .header h1 { margin: 0; color: #6d28d9; font-size: 28px; }
              .header p { margin: 5px 0 0; font-size: 14px; color: #555; }
              .movie-title { font-size: 22px; font-weight: bold; margin-bottom: 5px; color: #111; }
              .theater-name { font-size: 14px; color: #555; margin-bottom: 20px; }
              .details-grid { display: grid; grid-template-columns: 100px 1fr; gap: 10px; font-size: 14px; }
              .details-grid strong { color: #333; }
              .qr-section { text-align: center; margin-top: 25px; }
              .qr-section img { width: 120px; height: 120px; margin-bottom: 5px; }
              .booking-id { margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; text-align: center; }
              .booking-id strong { font-size: 16px; color: #6d28d9; letter-spacing: 1px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          </style>
      </head>
      <body>
          <div class="ticket">
              <div class="header">
                  <h1>CinePass</h1>
                  <p>Your Movie Ticket</p>
              </div>
              
              <h2 class="movie-title">${movie.title}</h2>
              <p class="theater-name">at ${theater.name}</p>

              <div class="details-grid">
                  <strong>Date:</strong>
                  <span>${new Date(startTime).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</span>
                  
                  <strong>Time:</strong>
                  <span>${new Date(startTime).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}</span>
                  
                  <strong>Screen:</strong>
                  <span>${screen}</span>

                  <strong>Seats:</strong>
                  <span>${booking.seats.join(", ")}</span>
              </div>
              
              <div class="booking-id">
                  <p style="margin:0; font-size: 12px; color: #555;">Booking ID</p>
                  <strong>${booking.bookingReference}</strong>
              </div>

              ${
                booking.qrCode
                  ? `
              <div class="qr-section">
                  <img src="${booking.qrCode}" alt="Booking QR Code">
                  <p style="font-size: 12px; color: #555; margin:0;">Scan at the entrance</p>
              </div>
              `
                  : ""
              }

              <div class="footer">
                  Enjoy the show!
              </div>
          </div>
      </body>
      </html>
    `;

  if (!booking.qrCode) {
    throw new ApiError(404, "QR code not available for this booking.");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        htmlContent: ticketHtml,
        filename: `CinePass_Ticket_${
          booking.bookingReference || booking._id
        }.html`,
      },
      "Ticket HTML generated successfully."
    )
  );
});

const calculateFinalPrice = async (showtime, seats, promoCode) => {
  let subtotal = 0;
  const seatDetailMap = new Map(
    showtime.seatAvailability.map((s) => [s.seatName, s])
  );
  seats.forEach((seatName) => {
    const seatDetail = seatDetailMap.get(seatName);
    if (!seatDetail) throw new ApiError(400, `Invalid seat ${seatName}`);
    subtotal +=
      seatDetail.type === "premium"
        ? showtime.ticketPrice.premium
        : showtime.ticketPrice.standard;
  });

  let finalPrice = subtotal;
  let discount = 0;

  if (promoCode) {
    const offer = await Offer.findOne({ promoCode: promoCode.toUpperCase() });
    if (
      !offer ||
      !offer.isActive ||
      new Date() > offer.validUntil ||
      subtotal < offer.minPurchaseAmount
    ) {
      throw new ApiError(
        400,
        "The provided promo code is invalid or has expired."
      );
    }

    if (offer.discountType === "percentage") {
      discount = subtotal * (offer.discountValue / 100);
    } else {
      discount = offer.discountValue;
    }

    finalPrice = Math.max(0, subtotal - discount);
  }

  return { totalPrice: finalPrice, subtotal, discount };
};
