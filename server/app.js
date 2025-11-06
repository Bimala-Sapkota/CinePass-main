import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/mongo.config.js";
import path from "path";
import { fileURLToPath } from "url";
import { ApiError } from "./utils/ApiError.js";
import { cleanupAllExpiredLocks } from "./utils/showtime.util.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCK_CLEANUP_INTERVAL = 10 * 60 * 1000;
setInterval(() => {
  console.log("Running scheduled job: Cleaning up expired seat locks...");
  cleanupAllExpiredLocks().catch((err) =>
    console.error("Error during scheduled lock cleanup:", err)
  );
}, LOCK_CLEANUP_INTERVAL);

const app = express();
const port = process.env.PORT || 8000;

//middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Routes[GET]
app.get("/", (req, res) => {
  res.send("Hello World!");
});

//Routes[POST]
import contactRoutes from "./routes/contact.routes.js";
import authRoutes from "./routes/auth.routes.js";
import movieRoutes from "./routes/movie.routes.js";
import theaterRoutes from "./routes/theater.routes.js";
import showtimeRoutes from "./routes/showtime.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import watchlistRoutes from "./routes/watchlist.routes.js";
import historyRoutes from "./routes/history.routes.js";
import recommendationRoutes from "./routes/recommendations.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import offerRoutes from "./routes/offer.routes.js";

app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/movies/:movieId/reviews", reviewRoutes);
app.use("/api/theaters", theaterRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/offers", offerRoutes);

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  console.error("UNHANDLED ERROR:", err.stack);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});


connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`App is listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("FAILED TO CONNECT TO MONGODB:", err);
    process.exit(1); 
  });
