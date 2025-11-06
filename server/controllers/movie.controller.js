import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import { Movie } from "../models/Movie.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.util.js";
import { ApiError } from './../utils/ApiError.js';

//  POST /api/movies PRIVATE[Admin]
export const createMovie = asyncHandler(async (req, res) => {
    const { title, description, director, cast, duration, genre, language, releaseDate, posterImageUrl, bannerImageUrl, ...rest } = req.body;

    const movieData = { title, description, director, cast, duration, genre, language, releaseDate, ...rest }
    const posterFile = req.files?.posterImage?.[0];
    const bannerFile = req.files?.bannerImage?.[0];


    if (posterFile) {
        const posterUpload = await uploadOnCloudinary(posterFile.buffer, posterFile.mimetype, "movies/posters")
        if (!posterUpload) {
            throw new ApiError(500, "Failed to upload poster image.");
        }
        movieData.posterImage = { url: posterUpload.secure_url, public_id: posterUpload.public_id }
    } else if (posterImageUrl) {
        movieData.posterImage = { url: posterImageUrl, public_id: null };
    } else {
        throw new ApiError(400, "Poster image file or posterImageUrl is required.")
    }

    if (bannerFile) {
        const bannerUpload = await uploadOnCloudinary(bannerFile.buffer, bannerFile.mimetype, "movies/banners");
        if (bannerUpload) {
            movieData.bannerImage = { url: bannerUpload.secure_url, public_id: bannerUpload.public_id };
        }
    } else if (bannerImageUrl) {
        movieData.bannerImage = { url: bannerImageUrl, public_id: null };
    }

    const movie = await Movie.create(movieData)
    if (!movie) {
        throw new ApiError(500, "Something went wrong while creating the movie.")
    }

    return res.status(201).json(new ApiResponse(201, movie, "Movie created successfully."))
})

// GET /api/movies PUBLIC
export const getAllMovies = asyncHandler(async (req, res) => {
    const filter = {};

    if (req.query.featured) {
        filter.featured = req.query.featured === 'true';
    }
    if (req.query.isNowShowing) {
        filter.isNowShowing = req.query.isNowShowing === 'true';
    }
    if (req.query.isComingSoon) {
        filter.isComingSoon = req.query.isComingSoon === 'true';
    }
    if (req.query.isLatest) {
        filter.isLatest = req.query.isLatest === 'true';
    }

    if (req.query.search) {
        const searchQuery = req.query.search;
        filter.$or = [
            { title: { $regex: searchQuery, $options: 'i' } },
            { titleNepali: { $regex: searchQuery, $options: 'i' } },
            { director: { $regex: searchQuery, $options: 'i' } }
        ]
    }

    const movies = await Movie.find(filter);
    return res.status(200).json(
        new ApiResponse(200, movies, "Movies fetched successfully.")
    )
})

// GET /api/movies/:id PUBLIC
export const getMovieById = asyncHandler(async (req, res) => {
     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new ApiError(400, "Invalid movie ID format.");
    }
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
        throw new ApiError(404, "Movie not found.")
    }

    return res.status(200).json(new ApiResponse(200, movie, "Movie fetched successfully."))
})

//  PUT /api/movies/:id PRIVATE[Admin]
export const updateMovie = asyncHandler(async (req, res) => {
    let movie = await Movie.findById(req.params.id);
    if (!movie) {
        throw new ApiError(404, "Movie not found.");
    }

    const updateData = { ...req.body };

    if (req.files?.posterImage?.[0]) {
        const posterUpload = await uploadOnCloudinary(req.files.posterImage[0].buffer, req.files.posterImage[0].mimetype, "movies/posters");
        if (!posterUpload)
            throw new ApiError(500, 'Failed to upload new poster image.')

        if (movie.posterImage?.public_id) {
            await deleteFromCloudinary(movie.posterImage.public_id)
        }
        updateData.posterImage = { url: posterUpload.secure_url, public_id: posterUpload.public_id }
    }

    if (req.files?.bannerImage?.[0]) {
        const bannerUpload = await uploadOnCloudinary(req.files.bannerImage[0].buffer, req.files.bannerImage[0].mimetype, "movies/banners");
        if (!bannerUpload) throw new ApiError(500, 'Failed to upload new banner image.');

        if (movie.bannerImage?.public_id) {
            await deleteFromCloudinary(movie.bannerImage.public_id);
        }

        updateData.bannerImage = { url: bannerUpload.secure_url, public_id: bannerUpload.public_id };
    }

    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, { $set: updateData }, {
        new: true,
        runValidators: true
    })

    return res.status(200).json(
        new ApiResponse(200, updatedMovie, "Movie updated successfully.")
    )
})


// DELETE /api/movies/:id PRIVATE[Admin]
export const deleteMovie = asyncHandler(async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
        throw new ApiError(404, "Movie not found.");
    }

    await movie.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Movie deleted successfully"))
})