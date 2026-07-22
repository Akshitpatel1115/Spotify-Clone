const express = require("express");
const authController = require("../controller/auth.controller");
const checkAuthBlock = require("../middleware/authBlock.middleware");

const router = express.Router();

router.post("/register", checkAuthBlock, authController.register);
router.post("/resend-otp", checkAuthBlock, authController.resendOtp);
router.post("/verify-email", checkAuthBlock, authController.verifyEmail);
router.post("/login", checkAuthBlock, authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", checkAuthBlock, authController.forgotPassword);
router.post("/verify-reset-otp", checkAuthBlock, authController.verifyResetOtp);
router.post("/reset-password", checkAuthBlock, authController.resetPassword);

module.exports = router;
