import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    avatar: {
      type: String,
      required: true,
    },

    coverImage: {
      type: String,
    },

    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    refreshToken: {
      type: String,
    },

    // ✅ EMAIL VERIFICATION OTP
    emailVerificationCode: {
      type: String,
    },
    emailVerificationExpire: {
      type: Date,
    },

    // ✅ PASSWORD RESET OTP
    passwordResetCode: {
      type: String,
    },
    passwordResetExpire: {
      type: Date,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // ✅ used to invalidate old tokens after password reset
    passwordChangedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// ✅ hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// ✅ Generate Email Verification Code
userSchema.methods.generateEmailVerificationCode = function () {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Hash the code before storing
  const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
  
  this.emailVerificationCode = hashedCode;
  this.emailVerificationExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return code; // Return plain code to send via email
};

// ✅ Generate Password Reset Code
userSchema.methods.generatePasswordResetCode = function () {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Hash the code before storing
  const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
  
  this.passwordResetCode = hashedCode;
  this.passwordResetExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return code; // Return plain code to send via email
};


export const User = mongoose.model("User", userSchema);
