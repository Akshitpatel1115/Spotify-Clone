const userModel = require("../models/user.model");
const PendingUser = require("../models/pendingUser.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendOTPEmail, sendPasswordResetEmail } = require("../services/email.service");

const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

async function register(req, res) {
  try {
    const { username, email, password, role = "user" } = req.body;

    // Step 1: Validate
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (username.trim() === "" || email.trim() === "" || password.trim() === "") {
      return res.status(400).json({ success: false, message: "Fields cannot be empty" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Step 2: Check Users Collection
    const isUserAlreadyExist = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserAlreadyExist) {
      return res.status(409).json({
        success: false,
        message: "User already exists. Please log in.",
      });
    }

    // Step 3: Check PendingUsers Collection
    const isUserPending = await PendingUser.findOne({ email });

    if (isUserPending) {
      return res.status(409).json({
        success: false,
        message: "Registration is pending. Please verify your OTP to continue.",
      });
    }

    // Step 4: Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 5: Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Step 6: Hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Step 7: Store inside PendingUsers
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const resendAvailableAt = new Date(Date.now() + 2 * 60 * 1000);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await PendingUser.create({
      username,
      email,
      password: hashedPassword,
      role,
      otp: hashedOtp,
      otpExpiresAt,
      resendAvailableAt,
      expiresAt,
    });

    // Step 8: Send OTP email via Resend
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("\n=========================================");
      console.error("⚠️  EMAIL DELIVERY FAILED  ⚠️");
      console.error("Please verify your RESEND_API_KEY and EMAIL_FROM in .env.");
      console.error("For testing purposes, your OTP is: ", otp);
      console.error("=========================================\n");
      // We do NOT throw here. We allow the registration to proceed so you can test the frontend UI using the OTP printed above!
    }

    // Step 9: Return success response
    return res.status(201).json({
      success: true,
      message: "Registration step 1 complete. OTP sent to your email.",
    });
  } catch (error) {
    console.error("[Register] Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error during registration." });
  }
}

async function resendOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res.status(404).json({
        success: false,
        message: "No pending registration found for this email.",
      });
    }

    if (pendingUser.expiresAt < new Date()) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      return res.status(400).json({
        success: false,
        message: "Registration window has expired. Please register again.",
      });
    }

    if (pendingUser.resendAvailableAt > new Date()) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting another OTP.",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const now = Date.now();
    pendingUser.otp = hashedOtp;
    pendingUser.otpExpiresAt = new Date(now + 10 * 60 * 1000);
    pendingUser.resendAvailableAt = new Date(now + 2 * 60 * 1000);
    pendingUser.expiresAt = new Date(now + 30 * 60 * 1000);
    pendingUser.otpAttempts = 0; // Reset attempts on new OTP

    await pendingUser.save();

    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.log(emailError)
      console.error("⚠️  EMAIL DELIVERY FAILED  ⚠️");
    }

    return res.status(200).json({
      success: true,
      message: "A new verification code has been sent.",
    });
  } catch (error) {
    console.error("[Resend OTP] Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error while resending OTP." });
  }
}

async function login(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username && !email) {
      return res.status(400).json({ success: false, message: "Email or username is required." });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required." });
    }

    // Step 1: Find User
    const user = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Step 2 is now handled by authBlock middleware

    // Step 3: Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Step 4: If password is incorrect
    if (!isPasswordValid) {
      user.loginAttempts += 1;
      
      const MAX_ATTEMPTS = parseInt(process.env.LOGIN_MAX_ATTEMPTS) || 5;
      const LOCK_MINUTES = parseInt(process.env.LOGIN_LOCK_MINUTES) || 15;

      if (user.loginAttempts >= MAX_ATTEMPTS) {
        user.authBlock = {
          isBlocked: true,
          reason: "LOGIN_SECURITY",
          blockedUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
        };
        await user.save();
        return res.status(423).json({
          success: false,
          message: `Too many failed login attempts. Please try again after sometime.`,
        });
      }
      
      await user.save();

      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Step 5: If password is correct, reset attempts
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
    );

    res.cookie("token", token, cookieOptions);

    // Sanitize user data (Remove password, authBlock, etc.)
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.authBlock;
    delete userResponse.resetPasswordOTP;
    delete userResponse.loginAttempts;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token: token,
      }
    });
  } catch (error) {
    console.error("[Login] Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error during login." });
  }
}

async function logout(req, res) {
  res.clearCookie("token", cookieOptions);
  res.status(200).json({
    success: true,
    message: "Logout successfully.",
  });
}

async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;

    // Step 1: Validate
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP format." });
    }

    // Step 2: Find Pending User
    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res.status(404).json({
        success: false,
        message:
          "No pending registration found for this email. It may have expired.",
      });
    }

    // Step 3: Check Registration Expired (Failsafe for TTL)
    if (pendingUser.expiresAt < new Date()) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      return res.status(400).json({
        success: false,
        message: "Registration window has expired. Please register again.",
      });
    }

    // Step 4: Check OTP Expired
    if (pendingUser.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Step 5: Compare OTP using bcrypt
    const isOtpValid = await bcrypt.compare(otp, pendingUser.otp);

    // Step 6: If OTP is incorrect
    if (!isOtpValid) {
      pendingUser.otpAttempts += 1;
      
      const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS) || 5;
      const OTP_BLOCK_MINUTES = parseInt(process.env.OTP_BLOCK_MINUTES) || 5;

      if (pendingUser.otpAttempts >= MAX_ATTEMPTS) {
        pendingUser.authBlock = {
          isBlocked: true,
          reason: "OTP_VERIFICATION",
          blockedUntil: new Date(Date.now() + OTP_BLOCK_MINUTES * 60 * 1000)
        };
        await pendingUser.save();
        return res.status(423).json({
          success: false,
          message: `Authentication is temporarily blocked. Please try again after sometime.`,
        });
      }
      
      await pendingUser.save();
      return res.status(401).json({ success: false, message: "Invalid verification code." });
    }

    // Step 8: Create Real User
    // Double check that the real user wasn't somehow created already
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      return res.status(409).json({ success: false, message: "User already exists." });
    }

    const newUser = await userModel.create({
      username: pendingUser.username,
      email: pendingUser.email,
      password: pendingUser.password, // Already hashed
      role: pendingUser.role,
    });

    // Step 8: Delete Pending User
    await PendingUser.deleteOne({ _id: pendingUser._id });

    // Step 9: Return Success
    return res.status(200).json({
      success: true,
      message: "Email verified successfully. Please login to continue.",
    });
  } catch (error) {
    console.error("Verification Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error during verification." });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const user = await userModel.findOne({ email });

    // For security, always return success even if user doesn't exist to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists, a verification code has been sent.",
      });
    }

    // Check cooldown
    if (user.resetPasswordResendAvailableAt > new Date()) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting another OTP.",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const now = Date.now();
    user.resetPasswordOTP = hashedOtp;
    user.resetPasswordOTPExpiresAt = new Date(now + 10 * 60 * 1000);
    user.resetPasswordResendAvailableAt = new Date(now + 2 * 60 * 1000);
    user.resetPasswordVerified = false;
    user.resetPasswordOtpAttempts = 0; // Reset attempts on new OTP

    await user.save();

    try {
      await sendPasswordResetEmail(email, otp);
    } catch (emailError) {
      console.error("\n=========================================");
      console.error("⚠️  EMAIL DELIVERY FAILED  ⚠️");
      console.error("For testing purposes, your OTP is: ", otp);
      console.error("=========================================\n");
    }

    return res.status(200).json({
      success: true,
      message: "If an account exists, a verification code has been sent.",
    });
  } catch (error) {
    console.error("[Forgot Password] Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

async function verifyResetOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP format." });
    }

    const user = await userModel.findOne({ email });

    if (!user || !user.resetPasswordOTP) {
      return res.status(404).json({
        success: false,
        message: "No pending password reset found for this email.",
      });
    }

    if (user.resetPasswordOTPExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    const isOtpValid = await bcrypt.compare(otp, user.resetPasswordOTP);

    if (!isOtpValid) {
      user.resetPasswordOtpAttempts += 1;
      
      const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS) || 5;
      const OTP_BLOCK_MINUTES = parseInt(process.env.OTP_BLOCK_MINUTES) || 5;

      if (user.resetPasswordOtpAttempts >= MAX_ATTEMPTS) {
        user.authBlock = {
          isBlocked: true,
          reason: "OTP_VERIFICATION",
          blockedUntil: new Date(Date.now() + OTP_BLOCK_MINUTES * 60 * 1000)
        };
        await user.save();
        return res.status(423).json({
          success: false,
          message: `Authentication is temporarily blocked. Please try again after sometime.`,
        });
      }
      
      await user.save();
      return res.status(401).json({ success: false, message: "Invalid verification code." });
    }

    // OTP verified, unlock password reset step
    user.resetPasswordVerified = true;
    user.resetPasswordOtpAttempts = 0;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You may now reset your password.",
    });
  } catch (error) {
    console.error("[Verify Reset OTP] Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: "Email and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Security check: Must have successfully verified OTP
    if (user.resetPasswordVerified !== true) {
      return res.status(403).json({ success: false, message: "Forbidden. Please verify OTP first." });
    }

    // Security check: Must be within the 10-minute expiry window
    if (user.resetPasswordOTPExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Password reset window has expired. Please request a new OTP.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiresAt = undefined;
    user.resetPasswordResendAvailableAt = undefined;
    user.resetPasswordVerified = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please login using your new password.",
    });
  } catch (error) {
    console.error("[Reset Password] Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

module.exports = { register, resendOtp, verifyEmail, login, logout, forgotPassword, verifyResetOtp, resetPassword };
