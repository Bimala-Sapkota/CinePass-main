import { Booking } from "../models/Booking.model.js";
import { Movie } from "../models/Movie.model.js";

export class RecommendationEngine {
  static calculateMovieSimilarity(userPreferences, movieFeatures) {
    let similarityScore = 0;
    let totalFeatures = 0;

    //Genre (40%)
    if (userPreferences.genres && movieFeatures.genre) {
      const genreMatches = userPreferences.genres.filter((genre) =>
        movieFeatures.genre.includes(genre)
      ).length;
      const genreSimilarity =
        genreMatches /
        Math.max(userPreferences.genres.length, movieFeatures.genre.length);
      similarityScore += genreSimilarity * 0.4;
      totalFeatures += 0.4;
    }

    //Language (30%)
    if (userPreferences.languages && movieFeatures.language) {
      const languageSimilarity = userPreferences.languages.includes(
        movieFeatures.language
      )
        ? 1
        : 0;
      similarityScore += languageSimilarity * 0.3;
      totalFeatures += 0.3;
    }

    //Director (20%)
    if (userPreferences.directors && movieFeatures.director) {
      const directorSimilarity = userPreferences.directors.includes(
        movieFeatures.director
      )
        ? 1
        : 0;
      similarityScore += directorSimilarity * 0.2;
      totalFeatures += 0.2;
    }

    //Cast (10%)
    if (userPreferences.actors && movieFeatures.cast) {
      const actorMatches = userPreferences.actors.filter((actor) =>
        movieFeatures.cast.some((castMember) =>
          castMember.toLowerCase().includes(actor.toLowerCase())
        )
      ).length;
      const actorSimilarity =
        actorMatches /
        Math.max(userPreferences.actors.length, movieFeatures.cast.length);
      similarityScore += actorSimilarity * 0.1;
      totalFeatures += 0.1;
    }

    return totalFeatures > 0 ? similarityScore / totalFeatures : 0;
  }

  static extractUserPreferences(userBookings) {
    const preferences = {
      genres: {},
      languages: {},
      directors: {},
      actors: {},
    };

    const validBookings = userBookings.filter(
      (booking) => booking.showtime && booking.showtime.movie
    );

    validBookings.forEach((booking) => {
      const movie = booking.showtime.movie;

      if (movie.genre) {
        movie.genre.forEach((genre) => {
          preferences.genres[genre] = (preferences.genres[genre] || 0) + 1;
        });
      }

      if (movie.language) {
        preferences.languages[movie.language] =
          (preferences.languages[movie.language] || 0) + 1;
      }

      if (movie.director) {
        preferences.directors[movie.director] =
          (preferences.directors[movie.director] || 0) + 1;
      }

      if (movie.cast) {
        movie.cast.forEach((actor) => {
          preferences.actors[actor] = (preferences.actors[actor] || 0) + 1;
        });
      }
    });

    return {
      genres: Object.keys(preferences.genres).sort(
        (a, b) => preferences.genres[b] - preferences.genres[a]
      ),
      languages: Object.keys(preferences.languages).sort(
        (a, b) => preferences.languages[b] - preferences.languages[a]
      ),
      directors: Object.keys(preferences.directors).sort(
        (a, b) => preferences.directors[b] - preferences.directors[a]
      ),
      actors: Object.keys(preferences.actors).sort(
        (a, b) => preferences.actors[b] - preferences.actors[a]
      ),
    };
  }

  static async generateRecommendations(userId, limit = 6) {
    try {
      const userBookings = await Booking.find({ user: userId })
        .populate({
          path: "showtime",
          populate: {
            path: "movie",
            select:
              "title titleNepali genre language director cast posterImage",
          },
        })
        .limit(20)
        .sort({ createdAt: -1 });

      const validUserBookings = userBookings.filter(
        (booking) => booking.showtime && booking.showtime.movie
      );

      if (validUserBookings.length === 0) {
        const popularMovies = await Movie.find({
          isNowShowing: true,
        })
          .sort({ featured: -1, "userScore.average": -1 })
          .limit(limit);

        return popularMovies.map((movie) => ({
          ...movie.toObject(),
          recommendationScore: 0.5,
          reason: "Popular movie",
          reasonNepali: "लोकप्रिय चलचित्र",
        }));
      }

      const userPreferences = this.extractUserPreferences(userBookings);
      // exclude already watched movie
      const watchedMovieIds = validUserBookings.map(
        (booking) => booking.showtime.movie._id
      );

      const availableMovies = await Movie.find({
        _id: { $nin: watchedMovieIds },
        isNowShowing: true,
      });

      const recommendedMovies = availableMovies.map((movie) => {
        const similarityScore = this.calculateMovieSimilarity(userPreferences, {
          genre: movie.genre,
          language: movie.language,
          director: movie.director,
          cast: movie.cast,
        });

        let reason = "Based on your preferences";
        let reasonNepali = "तपाईंको प्राथमिकतामा आधारित";

        if (
          userPreferences.genres.length > 0 &&
          movie.genre.includes(userPreferences.genres[0])
        ) {
          reason = `Because you like ${userPreferences.genres[0]} movies`;
          reasonNepali = `तपाईंलाई ${userPreferences.genres[0]} चलचित्रहरू मन पर्ने भएकोले`;
        } else if (
          userPreferences.languages.length > 0 &&
          movie.language === userPreferences.languages[0]
        ) {
          reason = `Because you like movies in ${userPreferences.languages[0]}`;
          reasonNepali = `तपाईंलाई ${userPreferences.languages[0]} भाषाका चलचित्रहरू मन पर्ने भएकोले`;
        }

        return {
          ...movie.toObject(),
          recommendationScore: similarityScore,
          reason,
          reasonNepali,
        };
      });

      return recommendedMovies
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);
    } catch (error) {
      console.error(`Error genrating recommendations:`, error);
      const fallbackMovies = await Movie.find({
        isNowShowing: true,
      })
        .sort({ featured: -1 })
        .limit(limit);

      return fallbackMovies.map((movie) => ({
        ...movie.toObject(),
        recommendationScore: 0.3,
        reason: "Popular movie",
        reasonNepali: "लोकप्रिय चलचित्र",
      }));
    }
  }
}
