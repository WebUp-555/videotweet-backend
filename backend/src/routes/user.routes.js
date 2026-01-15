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
  verifyEmailCode,
  resetPassword,
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { sendEmail } from "../utils/nodemailer.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// ✅ TEST EMAIL ENDPOINT (ONLY for development)
if (process.env.NODE_ENV !== "production") {
  router.route("/test-email").post(
    asyncHandler(async (req, res) => {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }

      await sendEmail({
        to: email,
        subject: "Test Email",
        html: "<h1>Test Email</h1><p>If you see this, email is working ✅</p>",
      });

      res.json({ success: true, message: "Test email sent ✅" });
    })
  );
}

// ✅ Public routes
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/verify-email").post(verifyEmailCode);
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
