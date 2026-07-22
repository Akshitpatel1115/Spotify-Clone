const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'artist'],
    default: 'user',
  },
  otp: {
    type: String,
    required: true,
  },
  otpAttempts: {
    type: Number,
    default: 0,
  },
  otpExpiresAt: {
    type: Date,
    required: true,
  },
  resendAvailableAt: {
    type: Date,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '30m' } // MongoDB TTL index: automatically deletes document after 30 minutes
  }
}, { timestamps: true });

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);

module.exports = PendingUser;
