import asyncHandler from "../middleware/asyncHandler.js";
import { Booking } from "../models/Booking.model.js";
import { Movie } from "../models/Movie.model.js";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Theater } from "./../models/Theater.model.js";

//   GET /api/admin/stats PRIVATE[Admin]
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalMovies = await Movie.countDocuments();

  const bookingStats = await Booking.aggregate([
    {
      $match: { paymentStatus: "Completed" },
    },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  const stats = {
    totalUsers,
    totalMovies,
    totalBookings: bookingStats[0]?.totalBookings || 0,
    totalRevenue: bookingStats[0]?.totalRevenue,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard stats fetched successfully."));
});

//GET /api/admin/sales-report?days=30
export const getSalesReport = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const salesData = await Booking.aggregate([
    {
      $match: {
        paymentStatus: "Completed",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalRevenue: { $sum: "$totalPrice" },
        totalBookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const topMovies = await Booking.aggregate([
    {
      $match: {
        paymentStatus: "Completed",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $lookup: {
        from: "showtimes",
        localField: "showtime",
        foreignField: "_id",
        as: "showtimeDetails",
      },
    },
    { $unwind: "$showtimeDetails" },
    {
      $lookup: {
        from: "movies",
        localField: "showtimeDetails.movie",
        foreignField: "_id",
        as: "movieDetails",
      },
    },
    { $unwind: "$movieDetails" },
    {
      $group: {
        _id: "$movieDetails._id",
        movieTitle: { $first: "$movieDetails.title" },
        totalRevenue: { $sum: "$totalPrice" },
        totalBookings: { $sum: 1 },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },
    // {
    // $project: { _id: 0, movieTitle: "$movieDetails.title", totalRevenue: 1 },
    // },
  ]);

  const report = {
    periodDays: days,
    dailySales: salesData,
    topMovies,
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, report, `Sales report for the last ${days} days.`)
    );
});

let analyticsCache = {
  data: null,
  timestamp: null,
};
const CACHE_DURATION_MS = 60 * 60 * 1000;
//GET  /api/admin/analytics/comprehensive?startDate=...&endDate=... PRIVATE[Admin]
export const getComprehensiveAnalytics = asyncHandler(async (req, res) => {
  if (
    analyticsCache.data &&
    Date.now() - analyticsCache.timestamp < CACHE_DURATION_MS
  ) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          analyticsCache.data,
          "Comprehensive analytics fetched from cache."
        )
      );
  }
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const [
    revenueAnalytics,
    userEngagement,
    moviePerformance,
    theaterUtilization,
  ] = await Promise.all([
    getRevenueAnalytics(dateFilter),
    getUserEngagementMetrics(dateFilter),
    getMoviePerformanceStats(dateFilter),
    getTheaterUtilizationStats(dateFilter),
  ]);

  const analytics = {
    revenue: revenueAnalytics,
    userEngagement,
    moviePerformance,
    theaterUtilization,
    generatedAt: new Date(),
  };

  analyticsCache = { data: analytics, timestamp: Date.now() };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        analytics,
        "Comprehensive analytics fetched successfully."
      )
    );
});

//helper function for revenue analytics
const getRevenueAnalytics = async (dateFilter) => {
  const revenueData = await Booking.aggregate([
    { $match: { paymentStatus: "Completed", ...dateFilter } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        dailyRevenue: { $sum: "$totalPrice" },
        dailyBookings: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  const paymentMethodBreakdown = await Booking.aggregate([
    { $match: { paymentStatus: "Completed", ...dateFilter } },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        revenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  return {
    dailyRevenue: revenueData,
    paymentMethods: paymentMethodBreakdown,
    totalRevenue: revenueData.reduce((sum, day) => sum + day.dailyRevenue, 0),
    totalBookings: revenueData.reduce((sum, day) => sum + day.dailyBookings, 0),
  };
};

//helper function for user engagement metrics
const getUserEngagementMetrics = async (dateFilter) => {
  const newUsers = await User.countDocuments(dateFilter);
  const activeUsers = await Booking.distinct("user", {
    paymentStatus: "Completed",
    ...dateFilter,
  });

  const userActivity = await User.aggregate([
    {
      $lookup: {
        from: "bookings",
        localField: "_id",
        foreignField: "user",
        as: "bookings",
      },
    },
    {
      $project: {
        username: 1,
        email: 1,
        createdAt: 1,
        bookingCount: {
          $size: {
            $filter: {
              input: "$bookings",
              as: "booking",
              cond: { $eq: ["$$booking.paymentStatus", "Completed"] },
            },
          },
        },
        totalSpent: {
          $sum: {
            $map: {
              input: "$bookings",
              as: "booking",
              in: {
                $cond: [
                  { $eq: ["$$booking.paymentStatus", "Completed"] },
                  "$$booking.totalPrice",
                  0,
                ],
              },
            },
          },
        },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 },
  ]);

  return {
    newUsers,
    activeUsers: activeUsers.length,
    topSpenders: userActivity,
    retentionRate: newUsers > 0 ? (activeUsers.length / newUsers) * 100 : 0,
  };
};

//Helper function for movie performance stats
const getMoviePerformanceStats = async (dateFilter) => {
  const topMovies = await Booking.aggregate([
    { $match: { paymentStatus: "Completed", ...dateFilter } },
    {
      $lookup: {
        from: "showtimes",
        localField: "showtime",
        foreignField: "_id",
        as: "showtimeData",
      },
    },
    { $unwind: "$showtimeData" },
    {
      $lookup: {
        from: "movies",
        localField: "showtimeData.movie",
        foreignField: "_id",
        as: "movieData",
      },
    },
    { $unwind: "$movieData" },
    {
      $group: {
        _id: "$movieData._id",
        movieTitle: { $first: "$movieData.title" },
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: "$totalPrice" },
        averageRating: { $first: "$movieData.userScore.average" },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 },
  ]);

  const genrePerformance = await Movie.aggregate([
    { $unwind: "$genre" },
    {
      $group: {
        _id: "$genre",
        movieCount: { $sum: 1 },
        totalBookings: { $sum: "$bookingCount" },
        averangeRating: { $avg: "$userScore.average" },
      },
    },
    { $sort: { totalBookings: -1 } },
  ]);

  return {
    topPerformingMovies: topMovies,
    genrePerformance,
    totalMoviesShowing: await Movie.countDocuments({ isNowShowing: true }),
  };
};

//helper function for theater utilization stats
const getTheaterUtilizationStats = async (dateFilter) => {
  const theaterStats = await Booking.aggregate([
    { $match: { paymentStatus: "Completed", ...dateFilter } },
    {
      $lookup: {
        from: "showtimes",
        localField: "showtime",
        foreignField: "_id",
        as: "showtimeData",
      },
    },
    { $unwind: "$showtimeData" },
    {
      $lookup: {
        from: "theaters",
        localField: "showtimeData.theater",
        foreignField: "_id",
        as: "theaterData",
      },
    },
    { $unwind: "$theaterData" },
    {
      $group: {
        _id: "$showtimeData.theater",
        theaterName: { $first: "$theaterData.name" },
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: "$totalPrice" },
        uniqueMovies: { $addToSet: "$showtimeData.movie" },
      },
    },
    {
      $project: {
        theaterName: 1,
        totalBookings: 1,
        totalRevenue: 1,
        uniqueMoviesCount: { $size: "$uniqueMovies" },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  return {
    theaterPerformance: theaterStats,
    totalTheaters: await Theater.countDocuments(),
  };
};
