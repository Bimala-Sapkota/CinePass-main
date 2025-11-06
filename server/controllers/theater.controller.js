import asyncHandler from "../middleware/asyncHandler.js";
import { Showtime } from "../models/Showtime.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.util.js";
import { Theater } from "./../models/Theater.model.js";

//   POST /api/theaters PRIVATE[Admin]
export const createTheater = asyncHandler(async (req, res) => {
  const {
    name,
    nameNepali,
    location,
    locationNepali,
    city,
    amenities,
    screens,
    imageUrls,
  } = req.body;
  if (!name || !location || !city) {
    throw new ApiError(400, "Name, location, and city are required fields.");
  }

  const theaterData = {
    name,
    nameNepali,
    location,
    locationNepali,
    city,
    amenities: amenities || [],
  };

  if (screens && typeof screens === "string") {
    try {
      theaterData.screens = JSON.parse(req.body.screens);
    } catch (error) {
      throw new ApiError(400, "The 'screens' field is not valid JSON.");
    }
  } else {
    theaterData.screens = [];
  }

  theaterData.images = [];

  if (req.body["contact.phone"] || req.body["contact.email"]) {
    theaterData.contact = {
      phone: req.body["contact.phone"] || "",
      email: req.body["contact.email"] || "",
    };
  }

  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) =>
      uploadOnCloudinary(file.buffer, file.mimetype, "theaters")
    );
    const uploadResults = await Promise.all(uploadPromises);

    uploadResults.forEach((result) => {
      if (result) {
        theaterData.images.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    });
  }

  if (imageUrls && Array.isArray(imageUrls)) {
    imageUrls.forEach((url) => {
      theaterData.images.push({ url: url, public_id: null });
    });
  }

  const theater = await Theater.create(theaterData);
  return res
    .status(201)
    .json(new ApiResponse(201, theater, "Theater created successfully."));
});

//   GET /api/theaters PUBLIC
export const getAllTheaters = asyncHandler(async (req, res) => {
  const theaters = await Theater.find({});
  return res
    .status(200)
    .json(new ApiResponse(200, theaters, "Theaters fetched successfully."));
});

//   GET /api/theaters/:id PUBLIC
export const getTheaterById = asyncHandler(async (req, res) => {
  const theater = await Theater.findById(req.params.id);

  if (!theater) {
    throw new ApiError(404, "Theater not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, theater, "Theater fetched successfully."));
});

//   PUT /api/theaters/:id PRIVATE[Admin]
export const updateTheater = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    nameNepali,
    location,
    locationNepali,
    city,
    screens,
    amenities,
    imagesToDelete,
  } = req.body;

  const theater = await Theater.findById(id);
  if (!theater) throw new ApiError(404, "Theater not found.");

  const updateData = {};
  if (name) updateData.name = name;
  if (nameNepali) updateData.nameNepali = nameNepali;
  if (location) updateData.location = location;
  if (locationNepali) updateData.locationNepali = locationNepali;
  if (city) updateData.city = city;

  const contactObject = {};
  if (req.body["contact.phone"] !== undefined)
    contactObject.phone = req.body["contact.phone"];
  if (req.body["contact.email"] !== undefined)
    contactObject.email = req.body["contact.email"];
  updateData.contact = contactObject;

  if (amenities !== undefined) {
    updateData.amenities = Array.isArray(amenities)
      ? amenities
      : amenities
      ? [amenities]
      : [];
  } else {
    updateData.amenities = []; //if all amenities are unchecked
  }

  if (screens && typeof screens === "string") {
    try {
      updateData.screens = JSON.parse(screens);
    } catch (e) {
      throw new ApiError(400, "The 'screens' field is not valid JSON.");
    }
  }

  const newImages = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) =>
      uploadOnCloudinary(file.buffer, file.mimetype, "theaters")
    );
    const uploadResults = await Promise.all(uploadPromises);
    uploadResults.forEach((result) => {
      if (result)
        newImages.push({ url: result.secure_url, public_id: result.public_id });
    });
  }

  let finalImages = theater.images.filter((img) => img && img.url);
  let parsedImagesToDelete = [];
  if (imagesToDelete && typeof imagesToDelete === "string") {
    try {
      parsedImagesToDelete = JSON.parse(imagesToDelete);
    } catch (e) {
      console.log("Could not parse imagesToDelete JSON string");
    }
  }

  if (Array.isArray(parsedImagesToDelete) && parsedImagesToDelete.length > 0) {
    const publicIdsToDelete = parsedImagesToDelete.map((img) => img.public_id);
    const deletePromises = publicIdsToDelete.map((public_id) =>
      deleteFromCloudinary(public_id)
    );
    await Promise.all(deletePromises);
    finalImages = finalImages.filter(
      (img) => !publicIdsToDelete.includes(img.public_id)
    );
  }

  finalImages.push(...newImages);
  updateData.images = finalImages;

  const updatedTheater = await Theater.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true, context: "query" }
  );

  if (!updatedTheater) {
    throw new ApiError(404, "Theater not found after update attemp.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedTheater, "Theater updated successfully.")
    );
});

//   DELETE /api/theaters/:id PRIVATE[Admin]
export const deleteTheater = asyncHandler(async (req, res) => {
  const theaterId = req.params.id;
  const theater = await Theater.findById(theaterId);
  if (!theater) {
    throw new ApiError(404, "Theater not found.");
  }

  await Showtime.deleteMany({ theater: theaterId });
  
  if (theater.images && theater.images.length > 0) {
    const deletePromises = theater.images
      .filter((img) => img.public_id)
      .map((img) => deleteFromCloudinary(img.public_id));
    await Promise.all(deletePromises);
  }

  await theater.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Theater deleted successfully."));
});
