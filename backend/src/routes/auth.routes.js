const express = require("express");
const authController = require("../controller/auth.controller");
const checkAuthBlock = require("../middleware/authBlock.middleware");
const rateLimit = require("express-rate-limit");

const authRateLimiter = rateLimit({
  windowMs: (parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

router.use(authRateLimiter);

router.post("/register", checkAuthBlock, authController.register);
router.post("/resend-otp", checkAuthBlock, authController.resendOtp);
router.post("/verify-email", checkAuthBlock, authController.verifyEmail);
router.post("/login", checkAuthBlock, authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", checkAuthBlock, authController.forgotPassword);
router.post("/verify-reset-otp", checkAuthBlock, authController.verifyResetOtp);
router.post("/reset-password", checkAuthBlock, authController.resetPassword);

module.exports = router;
