const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "artist"],
    default: "user",
  },
  resetPasswordOTP: {
    type: String,
  },
  resetPasswordOTPExpiresAt: {
    type: Date,
  },
  resetPasswordResendAvailableAt: {
    type: Date,
  },
  resetPasswordVerified: {
    type: Boolean,
    default: false,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
  resetPasswordOtpAttempts: {
    type: Number,
    default: 0,
  }
});

const userModel = new mongoose.model("user", userSchema);

module.exports = userModel