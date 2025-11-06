import { Showtime } from "../models/Showtime.model.js";
import { ApiError } from "./ApiError.js";

const LOCK_TIMEOUT_MINUTES = 7;

export const lockSeatsForShowtime = async (
  showtimeId,
  seats,
  userId,
  session
) => {
  console.log("Attempting to lock seats:", { showtimeId, seats, userId });
  const lockUntil = new Date(Date.now() + LOCK_TIMEOUT_MINUTES * 60 * 1000);

  const showtime = await Showtime.findById(showtimeId).session(session);
  if (!showtime) {
    throw new ApiError(404, "Showtime not found.");
  }
  console.log(
    "Current seat availability:",
    showtime.seatAvailability.filter((s) => seats.includes(s.seatName))
  );
  const result = await Showtime.updateOne(
    {
      _id: showtimeId,
      // $elemMatch ensures that within the SAME array element, both conditions are met.
      // $not ensures that no such element exists.
      seatAvailability: {
        $all: seats.map((seatName) => ({
          $elemMatch: { seatName: seatName, status: "available" },
        })),
        // $not: {
        //   $elemMatch: {
        //     seatName: { $in: seats },
        //     status: { $in: ["locked", "booked"] },
        //   },
        // },
      },
    },
    {
      $set: {
        "seatAvailability.$[elem].status": "locked",
        "seatAvailability.$[elem].user": userId,
        "seatAvailability.$[elem].lockedUntil": lockUntil,
        hasLockedSeats: true,
      },
    },
    {
      arrayFilters: [{ "elem.seatName": { $in: seats } }],
      session,
    }
  );

  console.log("Lock operation result:", result);
  if (result.modifiedCount === 0) {
    throw new ApiError(
      409,
      `One or more requested seats are no longer available. Please try again.`
    );
  }
  return lockUntil;
};

export const bookSeatsForShowtime = async (
  showtimeId,
  seats,
  userId,
  session
) => {
  const result = await Showtime.updateOne(
    { _id: showtimeId },
    {
      $set: {
        "seatAvailability.$[elem].status": "booked",
        "seatAvailability.$[elem].lockedUntil": null,
      },
    },
    {
      arrayFilters: [
        {
          "elem.seatName": { $in: seats },
          "elem.status": "locked",
          "elem.user": userId,
        },
      ],
      session,
    }
  );

  if (result.modifiedCount === 0) {
    throw new ApiError(
      403,
      `Booking failed. Your lock on seats may have expired or they were invalid.`
    );
  }
};

export const releaseSeatsForShowtime = async (
  showtimeId,
  seats,
  userId,
  session
) => {
  await Showtime.updateOne(
    { _id: showtimeId },
    {
      $set: {
        "seatAvailability.$[elem].status": "available",
        "seatAvailability.$[elem].user": null,
        "seatAvailability.$[elem].lockedUntil": null,
      },
    },
    {
      arrayFilters: [
        {
          "elem.seatName": { $in: seats },
          "elem.status": "locked",
          "elem.user": userId,
        },
      ],
      session,
    }
  );
};

export const releaseBookedSeatsForShowtime = async (
  showtimeId,
  seats,
  session
) => {
  const result = await Showtime.updateOne(
    { _id: showtimeId },
    {
      $set: {
        "seatAvailability.$[elem].status": "available",
        "seatAvailability.$[elem].user": null,
        "seatAvailability.$[elem].lockedUntil": null,
      },
    },
    {
      arrayFilters: [
        {
          "elem.seatName": { $in: seats },
          "elem.status": "booked",
        },
      ],
      session,
    }
  );

  if (result.modifiedCount !== seats.length) {
    console.warn(
      `Attempted to release ${seats.length} booked seats for cancellation, but only modified ${result.modifiedCount}.`
    );
  }

  return result;
};

export const cleanupAllExpiredLocks = async () => {
  const now = new Date();
  console.log("Running scheduled job: Cleaning up expired seat locks...");

  const result = await Showtime.updateMany(
    {
      "seatAvailability.status": "locked",
      "seatAvailability.lockedUntil": { $lt: now },
    },

    {
      $set: {
        "seatAvailability.$[elem].status": "available",
        "seatAvailability.$[elem].user": null,
        "seatAvailability.$[elem].lockedUntil": null,
      },
    },
    {
      arrayFilters: [
        {
          "elem.status": "locked",
          "elem.lockedUntil": { $lt: now },
        },
      ],
    }
  );

  if (result.modifiedCount > 0) {
    console.log(
      `Cleaned up expired locks across ${result.modifiedCount} showtime(s).`
    );

    await Showtime.updateMany(
      { hasLockedSeats: true, "seatAvailability.status": { $ne: "locked" } },
      { $set: { hasLockedSeats: false } }
    );
  }
};
