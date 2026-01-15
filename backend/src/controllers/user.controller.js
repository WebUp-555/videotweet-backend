import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
import { sendVerificationCode } from "../utils/nodemailer.js";
import { toHttpsUrl, normalizeUserMedia, normalizeVideoMedia } from "../utils/mediaNormalizer.js";




const generate4DigitCode = () => Math.floor(1000 + Math.random() * 9000).toString();
const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);
// ✅ Cookie options (works on localhost + production)
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

// ✅ REGISTER USER
const registerUser = asyncHandler(async (req, res) => {
  let { fullname, email, username, password } = req.body;

  if ([fullname, email, username, password].some((f) => !f || f.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  email = email.toLowerCase();
  username = username.toLowerCase();

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists with this username/email");
  }

  const avatarLocalpath = req.files?.avatar?.[0]?.path;

  let coverImageLocalpath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalpath = req.files.coverImage[0].path;
  }

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalpath);
  const coverImage = await uploadOnCloudinary(coverImageLocalpath);

  if (!avatar?.secure_url && !avatar?.url) {
    throw new ApiError(400, "Avatar upload failed");
  }

  const avatarUrl = toHttpsUrl(avatar.secure_url || avatar.url);
  const coverImageUrl = toHttpsUrl(coverImage?.secure_url || coverImage?.url || "");

  const user = await User.create({
    fullname,
    avatar: avatarUrl,
    coverImage: coverImageUrl,
    email,
    username,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  const normalizedUser = normalizeUserMedia(createdUser);

  // ✅ Generate and send EMAIL verification code
  try {
    const verificationCode = user.generateEmailVerificationCode();
    await user.save({ validateBeforeSave: false });

    await sendVerificationCode(user.email, verificationCode, user.username, "verification");
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      normalizedUser,
      "User registered successfully. Please check your email for verification code."
    )
  );
});

// ✅ VERIFY EMAIL OTP
const verifyEmailCode = asyncHandler(async (req, res) => {
  let { email, code } = req.body;

  if (!email || !code) {
    throw new ApiError(400, "Email and verification code are required");
  }

  email = email.toLowerCase();

  const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

  const user = await User.findOne({
    email,
    emailVerificationCode: hashedCode,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  user.isEmailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpire = undefined;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Email verified successfully"));
});

// ✅ LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
  let { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  if (email) email = email.toLowerCase();
  if (username) username = username.toLowerCase();

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) throw new ApiError(404, "User does not exist");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid user password");

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const normalizedUser = normalizeUserMedia(loggedInUser);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: normalizedUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

// ✅ LOGOUT USER
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// ✅ REFRESH ACCESS TOKEN (FIXED)
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // ✅ FIX: correct destructuring
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// ✅ CHANGE CURRENT PASSWORD
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters");
  }

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();
  user.refreshToken = undefined;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

// ✅ GET CURRENT USER
const getCurrentUser = asyncHandler(async (req, res) => {
  const currentUser = normalizeUserMedia(req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, currentUser, "Current user fetched successfully"));
});

// ✅ UPDATE ACCOUNT DETAILS
const updateAccountDetails = asyncHandler(async (req, res) => {
  let { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "All fields are required");
  }

  email = email.toLowerCase();

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { fullname, email },
    },
    { new: true }
  ).select("-password -refreshToken");

  const normalizedUser = normalizeUserMedia(user);

  return res
    .status(200)
    .json(new ApiResponse(200, normalizedUser, "Account details updated successfully"));
});

// ✅ UPDATE USER AVATAR
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.secure_url && !avatar?.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  const avatarUrl = toHttpsUrl(avatar.secure_url || avatar.url);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatarUrl } },
    { new: true }
  ).select("-password -refreshToken");

  const normalizedUser = normalizeUserMedia(user);

  return res
    .status(200)
    .json(new ApiResponse(200, normalizedUser, "Avatar updated successfully"));
});

// ✅ UPDATE USER COVER IMAGE
const updateUserCoverimage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage?.secure_url && !coverImage?.url) {
    throw new ApiError(400, "Error while uploading cover image");
  }

  const coverImageUrl = toHttpsUrl(coverImage.secure_url || coverImage.url);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: coverImageUrl } },
    { new: true }
  ).select("-password -refreshToken");

  const normalizedUser = normalizeUserMedia(user);

  return res
    .status(200)
    .json(new ApiResponse(200, normalizedUser, "Cover image updated successfully"));
});

// ✅ GET USER CHANNEL PROFILE (unchanged from your logic)
const getUSerChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username not found");
  }

  const channel = await User.aggregate([
    {
      $match: { username: username?.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
        pipeline: [
          {
            $project: {
              title: 1,
              description: 1,
              thumbnail: 1,
              videoFile: 1,
              duration: 1,
              views: 1,
              likes: 1,
              createdAt: 1,
              owner: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        channelsSubscribedToCount: { $size: "$subscribedTo" },
        videosCount: { $size: "$videos" },
        viewsCount: { $sum: "$videos.views" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        videosCount: 1,
        viewsCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        bio: 1,
        createdAt: 1,
        updatedAt: 1,
        videos: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  const normalizedChannel = normalizeUserMedia({
    ...channel[0],
    videos: channel[0].videos?.map(normalizeVideoMedia) || []
  });

  return res
    .status(200)
    .json(new ApiResponse(200, normalizedChannel, "User channel fetched successfully"));
});

// ✅ GET WATCH HISTORY
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: "$owner" },
            },
          },
        ],
      },
    },
  ]);

  const watchHistory = user[0]?.watchHistory?.map(normalizeVideoMedia) || [];

  return res
    .status(200)
    .json(
      new ApiResponse(200, watchHistory, "Watch history fetched successfully")
    );
});

// ✅ ADD TO WATCH HISTORY
const addToWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId?.trim()) {
    throw new ApiError(400, "Video ID is required");
  }

  const validVideoId = new mongoose.Types.ObjectId(videoId);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $addToSet: {
        watchHistory: validVideoId,
      },
    },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const normalizedUser = normalizeUserMedia(user);

  return res
    .status(200)
    .json(new ApiResponse(200, normalizedUser, "Video added to watch history successfully"));
});

// ✅ FORGOT PASSWORD (SECURE RESPONSE)
const forgotPassword = asyncHandler(async (req, res) => {
  let { email } = req.body;

  if (!email) throw new ApiError(400, "Email is required");

  email = email.toLowerCase();

  const user = await User.findOne({ email });

  // ✅ no enumeration
  if (!user) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "If the email exists, reset OTP was sent"));
  }

  const resetCode = user.generatePasswordResetCode();
  await user.save({ validateBeforeSave: false });

  try {
    await sendVerificationCode(user.email, resetCode, user.username, "reset");
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, "Email could not be sent");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "If the email exists, reset OTP was sent"));
});

// ✅ RESET PASSWORD (KILLS SESSIONS)
const resetPassword = asyncHandler(async (req, res) => {
  let { email, code, password } = req.body;

  if (!email || !code || !password) {
    throw new ApiError(400, "Email, verification code, and new password are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  email = email.toLowerCase();

  const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

  const user = await User.findOne({
    email,
    passwordResetCode: hashedCode,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  user.password = password;

  // ✅ clear reset data
  user.passwordResetCode = undefined;
  user.passwordResetExpire = undefined;

  // ✅ kill sessions
  user.refreshToken = undefined;
  user.passwordChangedAt = new Date();

  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverimage,
  getUSerChannelProfile,
  getWatchHistory,
  addToWatchHistory,
  forgotPassword,
  verifyEmailCode,
  resetPassword,
};
