import asyncHandler from "../middleware/asyncHandler.js";
import { Showtime } from "../models/Showtime.model.js";
import { Movie } from "../models/Movie.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "./../utils/ApiError.js";
import { Theater } from "../models/Theater.model.js";
import { Watchlist } from "../models/Watchlist.model.js";
import { createInAppNotification } from "../utils/notification.util.js";
import { sendMovieIsNowShowingEmail } from "../utils/email.util.js";
import mongoose from "mongoose";

//   POST /api/showtimes PRIVATE[Admin]
export const createShowtime = asyncHandler(async (req, res) => {
  const { movie, theater, screen, startTime, ticketPrice } = req.body;

  // 1. Validate input
  // 2. Check if the Movie and Theater exist in the database
  // 3. Find the specific screen in the theater to get seat layout
  // 4. Generate the initial seat availability map based on the screen layout
  // 5. Create the showtime document
  if (!movie || !theater || !screen || !startTime || !ticketPrice) {
    throw new ApiError(
      400,
      "Movie, theater, screen, start time, and ticket price are required."
    );
  }

  const movieExists = await Movie.findById(movie);
  if (!movieExists) {
    throw new ApiError(404, `Movie not found with id of ${movie}`);
  }
  const theaterExists = await Theater.findById(theater);
  if (!theaterExists) {
    throw new ApiError(404, `Theater not found with id of ${theater}`);
  }

  const startTimeDate = new Date(startTime);
  const movieDurationInMinutes = movieExists.duration;
  const endTime = new Date(startTimeDate.getTime());
  endTime.setMinutes(startTimeDate.getMinutes() + movieDurationInMinutes);

  const screenDetails = theaterExists.screens.find((s) => s.name === screen);
  if (!screenDetails) {
    throw new ApiError(
      404,
      `Screen '${screen}' not found in theater '${theaterExists.name}'`
    );
  }
  const premiumSeatsSet = new Set(screenDetails.premiumSeats || []);
  let seatAvailability = [];

  for (let r = 0; r < screenDetails.rows; r++) {
    const rowChar = String.fromCharCode(65 + r);
    for (let s = 1; s <= screenDetails.seatsPerRow; s++) {
      const seatName = `${rowChar}${s}`;
      const seatType = premiumSeatsSet.has(seatName) ? "premium" : "standard";
      seatAvailability.push({
        seatName: seatName,
        status: "available",
        type: seatType,
        user: null,
        lockedUntil: null,
      });
    }
  }

  try {
    const showtime = await Showtime.create({
      movie,
      theater,
      screen,
      startTime,
      endTime,
      ticketPrice,
      seatAvailability,
    });

    if (showtime) {
      const usersToNotify = await Watchlist.find({
        movie: showtime.movie,
        status: "active",
      }).populate("user");

      if (usersToNotify.length > 0) {
        const movie = await Movie.findById(showtime.movie);
        const notificationMessage = `'${movie.title}' is now showing! Book your tickets now.`;
        const notificationLink = `/movies/${movie._id}`;

        for (const item of usersToNotify) {
          await createInAppNotification(
            item.user._id,
            notificationMessage,
            notificationLink
          );
          await sendMovieIsNowShowingEmail({
            email: item.user.email,
            username: item.user.username,
            movieTitle: movie.title,
            movieLink: `${process.env.APP_BASE_URL}${notificationLink}`,
          });

          item.status = "notified";
          await item.save();
        }
      }
    }
    return res
      .status(201)
      .json(new ApiResponse(201, showtime, "Showtime created successfully."));
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        409,
        "A showtime for this screen at this time already exists. Please check for overlaps."
      );
    }
    throw error;
  }
});

//   GET /api/showtimes PUBLIC
export const getAllShowtimes = asyncHandler(async (req, res) => {
  //filtering by movie or theater via query params for reqs such as /api/showtimes?movie=MOVIE_ID or /api/showtimes?theater=THEATER_ID
  const filter = {};

  if (req.query.movieId) {
    if (!mongoose.Types.ObjectId.isValid(req.query.movieId)) {
      // If it's not valid, throw a clean 400 error instead of crashing.
      throw new ApiError(400, "Invalid Movie ID format provided in query.");
    }
    filter.movie = req.query.movieId;
  }
  if (req.query.theaterId) {
    if (!mongoose.Types.ObjectId.isValid(req.query.theaterId)) {
      throw new ApiError(400, "Invalid Theater ID format provided in query.");
    }
    filter.theater = req.query.theaterId;
  }
  if (req.query.date) {
    const now = new Date();
    const selectedDate = new Date(req.query.date);
    const isToday =
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate();
    let startDate;
    if (isToday) {
      startDate = now;
    } else {
      selectedDate.setHours(0, 0, 0, 0);
      startDate = selectedDate;
    }

    const endDate = new Date(selectedDate);
    endDate.setDate(selectedDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);

    filter.startTime = {
      $gte: startDate,
      $lt: endDate,
    };
  }

  const showtimes = await Showtime.find(filter)
    .populate({
      path: "movie",
      select: "title titleNepali posterImage duration genre certification",
    })
    .populate({
      path: "theater",
      select: "name nameNepali location city amenities",
    })
    .sort({ startTime: 1 });

  if (req.query.movieId && req.query.theaterId) {
    return res
      .status(200)
      .json(new ApiResponse(200, showtimes, "Showtimes fetched successfully."));
  }

  const groupedByTheater = showtimes.reduce((acc, showtime) => {
    if (!showtime.theater) {
      console.warn(
        `Skipping showtime ID ${showtime._id} because its referenced theater is missing.`
      );
      return acc;
    }
    
    const theaterId = showtime.theater._id.toString();
    if (!acc[theaterId]) {
      acc[theaterId] = {
        theater: showtime.theater,
        showtimes: [],
      };
    }
    acc[theaterId].showtimes.push({
      _id: showtime._id,
      startTime: showtime.startTime,
      endTime: showtime.endTime,
      screen: showtime.screen,
      ticketPrice: showtime.ticketPrice,
      movie: showtime.movie,
    });
    return acc;
  }, {});

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        Object.values(groupedByTheater),
        "Showtimes fetched successfully."
      )
    );
});

//   GET /api/showtimes/:id PUBLIC
export const getShowtimeById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid Showtime ID format.");
  }
  const showtime = await Showtime.findById(req.params.id)
    .populate("movie")
    .populate("theater");

  if (!showtime) {
    throw new ApiError(404, "Showtime not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, showtime, "Showtime fetched successfully."));
});

//  GET /api/showtimes/:id/seats PRIVATE
export const getShowtimeSeatMap = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid Showtime ID format.");
  }
  const showtime = await Showtime.findById(req.params.id).populate("theater");
  if (!showtime) {
    throw new ApiError(404, "Showtime not found.");
  }

  const screenDetails = showtime.theater.screens.find(
    (s) => s.name === showtime.screen
  );
  if (!screenDetails) {
    throw new ApiError(404, `Screen details not found for showtime.`);
  }

  const rowLabels = [];
  for (let i = 0; i < screenDetails.rows; i++) {
    rowLabels.push(String.fromCharCode(65 + i));
  }

  const layout = {
    rows: rowLabels,
    seatsPerRow: screenDetails.seatsPerRow,
  };

  const seatData = showtime.seatAvailability.map((seat) => ({
    ...seat.toObject(),
    lockedByCurrentUser: seat.user && seat.user.toString() === req.user.id,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { seats: seatData, layout },
        "Seat map fetched successfully."
      )
    );
});

//   DELETE /api/showtimes/:id PUBLIC
export const deleteShowtime = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid Showtime ID format.");
  }
  const showtime = await Showtime.findById(req.params.id);

  if (!showtime) {
    throw new ApiError(404, "Showtime not found.");
  }

  await showtime.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Showtime deleted successfully."));
});
