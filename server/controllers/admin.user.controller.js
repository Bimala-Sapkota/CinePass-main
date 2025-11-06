import asyncHandler from "../middleware/asyncHandler.js";
import { User } from "../models/User.model.js";
import { Booking } from "../models/Booking.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// GET /api/admin/users PRIVATE[Admin]
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .select("-password")
    .limit(limit)
    .skip(skip)
    .lean();
  const totalUsers = await User.countDocuments();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
      },
      "Users fetched successfully."
    )
  );
});

// GET /api/admin/users/:Id PRIVATE[Admin]
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const bookingCount = await Booking.countDocuments({ user: req.params.id });
  const totalSpent = await Booking.aggregate([
    { $match: { user: user._id, paymentStatus: "Completed" } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);

  const userDetails = {
    ...user.toObject(),
    bookingCount,
    totalSpent: totalSpent[0]?.total || 0,
  };

  res
    .status(200)
    .json(new ApiResponse(200, userDetails, "User fetched successfully."));
});

//Patch /api/admin/users/:Id PRIVATE[Admin]
export const updateUser = asyncHandler(async (req, res) => {
  const { username, email, role } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.username = username || user.username;
  user.email = email || user.email;
  user.role = role || user.role;

  const updatedUser = await user.save();
  updatedUser.password = undefined;

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully."));
});

// DELETE /api/admin/users/:Id PRIVATE[Admin]
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  await user.deleteOne();

  res.status(200).json(new ApiResponse(200, {}, "User deleted successfully."));
});
