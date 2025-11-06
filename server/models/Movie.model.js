import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    titleNepali: {
      type: String,
      trim: true,
      maxlength: [100, "Nepali title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    descriptionNepali: {
      type: String,
    },
    director: {
      type: String,
      required: [true, "Please add director name"],
    },
    cast: {
      type: [String],
      required: [true, "Please add cast"],
    },
    duration: {
      type: Number,
      required: [true, "Please add duration in minutes"],
    },
    genre: {
      type: [String],
      required: [true, "Please add genres"],
      enum: [
        "Action",
        "Adventure",
        "Animation",
        "Biography",
        "Comedy",
        "Crime",
        "Documentary",
        "Drama",
        "Family",
        "Fantasy",
        "Political",
        "History",
        "Horror",
        "Musical",
        "Mystery",
        "Mythological",
        "Romance",
        "RomCom",
        "Sci-Fi",
        "Sports",
        "Thriller",
        "War",
        "Western",
      ],
    },
    language: {
      type: String,
      required: [true, "Please add language"],
    },
    certification: {
      type: String,
      enum: ["G", "PG", "PG-13", "R", "NC-17", "U", "U/A", "A"],
      default: "U",
    },
    releaseDate: {
      type: Date,
      required: [true, "Please add release date"],
    },
    endDate: {
      type: Date,
    },
    posterImage: {
      url: {
        type: String,
        required: [true, "Please add poster image URL"],
      },
      public_id: { type: String },
    },
    bannerImage: {
      url: {
        type: String,
      },
      public_id: { type: String },
    },
    trailerUrl: {
      type: String,
    },
    bookingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    socialLinks: {
      imdb: {
        type: String,
      },
    },
    statistics: {
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalRevenue: {
        type: Number,
        default: 0,
        min: 0,
      },
      peakBookingDate: {
        type: Date,
      },
      popularShowtimes: [
        {
          time: String,
          bookingCount: Number,
        },
      ],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    // isLatest: {
    //   type: Boolean,
    //   default: true,
    // },
    isNowShowing: {
      type: Boolean,
      default: true,
    },
    isComingSoon: {
      type: Boolean,
      default: false,
    },
    userScore: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

movieSchema.index({ director: 1, cast: 1 });
movieSchema.index({ isNowShowing: 1, featured: 1, createdAt: -1 });
movieSchema.index({ genre: 1, language: 1, isNowShowing: 1 });
movieSchema.index({ bookingCount: -1 });
movieSchema.index({ "statistics.averageRating": -1 });
movieSchema.index({ isNowShowing: 1, releaseDate: -1 });
movieSchema.index({ isComingSoon: 1, releaseDate: 1 });
movieSchema.index({ featured: 1, isNowShowing: 1 });

movieSchema.methods.incrementBookingCount = function (amount = 1) {
  this.bookingCount += amount;
  this.statistics.totalRevenue += amount;
  return this;
};

movieSchema.methods.updatePopularShowtimes = function (showtime) {
  const existingIndex = this.statistics.popularShowtimes.findIndex(
    (ps) => ps.time === showtime
  );

  if (existingIndex > -1) {
    this.statistics.popularShowtimes[existingIndex].bookingCount += 1;
  } else {
    this.statistics.popularShowtimes.push({
      time: showtime,
      bookingCount: 1,
    });
  }

  this.statistics.popularShowtimes.sort(
    (a, b) => b.bookingCount - a.bookingCount
  );
  this.statistics.popularShowtimes = this.statistics.popularShowtimes.slice(
    0,
    5
  );

  return this;
};

movieSchema.methods.updateTotalRevenue = function (revenueAmount) {
  this.statistics.totalRevenue += revenueAmount;
  return this;
};

export const Movie = mongoose.model("Movie", movieSchema);
