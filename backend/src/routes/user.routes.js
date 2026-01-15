import { Router } from "express";

import {
  loginUser,
  registerUser,
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
  resetPassword,
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// ✅ Public routes
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

// ✅ Semi-public (channel profile should not require login)
router.route("/c/:username").get(getUSerChannelProfile);

// ✅ Secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/cover-image").patch(
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverimage
);

router.route("/watchHistory/:videoId").post(verifyJWT, addToWatchHistory);
router.route("/watchHistory").get(verifyJWT, getWatchHistory);

export default router;
