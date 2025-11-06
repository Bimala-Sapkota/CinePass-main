import asyncHandler from "../middleware/asyncHandler.js";
import { User } from "../models/User.model.js";
import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.util.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendPasswordResetEmail } from "../utils/email.util.js";

//   POST /api/auth/register PUBLIC
export const register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, phone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(409, "A user with this email already exists.");
  }

  let avatarData = {
    url: "/uploads/default-avatar.png",
    public_id: null,
  };

  const avatarFile = req.file;
  if (avatarFile) {
    const avatarUpload = await uploadOnCloudinary(
      avatarFile.buffer,
      avatarFile.mimetype,
      "avatars"
    );
    if (!avatarUpload) throw new ApiError(500, "Error uploading avatar.");

    avatarData = {
      url: avatarUpload.secure_url,
      public_id: avatarUpload.public_id,
    };
  }

  const username = `${firstName}_${lastName}`.trim();

  const user = await User.create({
    username,
    email,
    password,
    phone,
    avatar: avatarData,
  });

  sendTokenResponse(user, 201, res);
});

//   POST /api/auth/login PUBLIC
export const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide an email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid credentials");
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error("🔴 Login Error:", err.stack);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

//   GET /api/auth/logout PRIVATE
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

//  GET /api/auth/me PRIVATE
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

//  PATCH /api/auth/updatedetails PRIVATE
export const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    username: req.body.username,
    email: req.body.email,
    phone: req.body.phone,
    preferredLanguage: req.body.preferredLanguage,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// PATCH /api/auth/updateavatar PRIVATE
export const updateAvatar = asyncHandler(async (req, res) => {
  const avatarFile = req.file;
  if (!avatarFile) {
    throw new ApiError(400, "No file uploaded.");
  }

  const avatarUpload = await uploadOnCloudinary(
    avatarFile.buffer,
    avatarFile.mimetype,
    "avatars"
  );
  if (!avatarUpload) {
    throw new ApiError(500, "Error uploading avatar.");
  }

  const oldAvatarPublicId = req.user.avatar?.public_id;
  if (oldAvatarPublicId) {
    await deleteFromCloudinary(oldAvatarPublicId);
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      avatar: {
        url: avatarUpload.secure_url,
        public_id: avatarUpload.public_id,
      },
    },
    { new: true, runValidators: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully."));
});

//   PATCH /api/auth/updatepassword PRIVATE
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.matchPassword(req.body.currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//  POST /api/auth/forgotpassword PRIVATE
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If a user with that email exists, a reset link has been sent."
        )
      );
  }

  const resetToken = crypto.randomBytes(20).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.APP_BASE_URL}/resetpassword/${resetToken}`;

  try {
    await sendPasswordResetEmail({
      email: user.email,
      username: user.username,
      resetUrl,
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If a user with that email exists, a reset link has been sent."
        )
      );
  } catch (error) {
    console.error(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, "Email could not be sent");
  }
});

//  PUT /api/auth/resetpassword/:resettoken PRIVATE
export const resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invlid or expired token");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// helper function
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const days = parseInt(process.env.JWT_COOKIE_EXPIRE, 10);
  const options = {
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  user.password = undefined;
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token, data: user });
};
