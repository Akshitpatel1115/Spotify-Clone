const express = require("express");
const authController = require("../controller/auth.controller");

const router = express.Router();

router.post("/register", authController.register);
router.post("/resend-otp", authController.resendOtp);
router.post("/verify-email", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;
