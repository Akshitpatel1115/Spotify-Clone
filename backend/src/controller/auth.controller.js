const userModel = require("../models/user.model");
const PendingUser = require("../models/pendingUser.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendOTPEmail } = require("../services/email.service");

const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

async function register(req, res) {
  try {
    console.log("[Register] API hit");
    const { username, email, password, role = "user" } = req.body;

    // Step 1: Validate
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Step 2: Check Users Collection
    console.log("[Register] Checking Users collection...");
    const isUserAlreadyExist = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserAlreadyExist) {
      return res.status(409).json({
        message: "User already exists. Please log in.",
      });
    }

    // Step 3: Check PendingUsers Collection
    console.log("[Register] Checking PendingUsers collection...");
    const isUserPending = await PendingUser.findOne({ email });

    if (isUserPending) {
      return res.status(409).json({
        message: "Registration is pending. Please verify your OTP to continue.",
      });
    }

    // Step 4: Hash Password
    console.log("[Register] Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 5: Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Step 6: Hash OTP
    console.log("[Register] Hashing OTP...");
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Step 7: Store inside PendingUsers
    console.log("[Register] Saving to PendingUsers DB...");
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
    console.log("[Register] Handing off to Resend Email Service...");
    try {
      await sendOTPEmail(email, otp);
      console.log("[Register] Email sent successfully!");
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
      message: "Registration step 1 complete. OTP sent to your email.",
    });
  } catch (error) {
    console.error("[Register] Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during registration." });
  }
}

async function resendOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res.status(404).json({
        message: "No pending registration found for this email.",
      });
    }

    if (pendingUser.expiresAt < new Date()) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      return res.status(400).json({
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

    await pendingUser.save();

    console.log("[Resend OTP] Handing off to Resend Email Service...");
    try {
      await sendOTPEmail(email, otp);
      console.log("[Resend OTP] Email sent successfully!");
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
    return res.status(500).json({ message: "Internal server error while resending OTP." });
  }
}

async function login(req, res) {
  const { username, email, password } = req.body;

  const user = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
  );

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    message: "Login successfull",
    user: user,
    token: token,
  });
}

async function logout(req, res) {
  res.clearCookie("token", cookieOptions);
  res.status(200).json({
    message: "Logout successfuly.",
  });
}

async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;

    // Step 1: Validate
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Step 2: Find Pending User
    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res.status(404).json({
        message:
          "No pending registration found for this email. It may have expired.",
      });
    }

    // Step 3: Check Registration Expired (Failsafe for TTL)
    if (pendingUser.expiresAt < new Date()) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      return res.status(400).json({
        message: "Registration window has expired. Please register again.",
      });
    }

    // Step 4: Check OTP Expired
    if (pendingUser.otpExpiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Step 5: Compare OTP using bcrypt
    const isOtpValid = await bcrypt.compare(otp, pendingUser.otp);

    // Step 6: If OTP is incorrect
    if (!isOtpValid) {
      return res.status(401).json({ message: "Invalid OTP." });
    }

    // Step 7: Create Real User
    // Double check that the real user wasn't somehow created already
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      return res.status(409).json({ message: "User already exists." });
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
      .json({ message: "Internal server error during verification." });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
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

    await user.save();

    console.log("[Forgot Password] Handing off to Resend Email Service...");
    try {
      await sendOTPEmail(email, otp);
      console.log("[Forgot Password] Email sent successfully!");
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
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function verifyResetOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const user = await userModel.findOne({ email });

    if (!user || !user.resetPasswordOTP) {
      return res.status(404).json({
        message: "No pending password reset found for this email.",
      });
    }

    if (user.resetPasswordOTPExpiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
      });
    }

    const isOtpValid = await bcrypt.compare(otp, user.resetPasswordOTP);

    if (!isOtpValid) {
      return res.status(401).json({ message: "Invalid OTP." });
    }

    // OTP verified, unlock password reset step
    user.resetPasswordVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You may now reset your password.",
    });
  } catch (error) {
    console.error("[Verify Reset OTP] Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Security check: Must have successfully verified OTP
    if (user.resetPasswordVerified !== true) {
      return res.status(403).json({ message: "Forbidden. Please verify OTP first." });
    }

    // Security check: Must be within the 10-minute expiry window
    if (user.resetPasswordOTPExpiresAt < new Date()) {
      return res.status(400).json({
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
    return res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = { register, resendOtp, verifyEmail, login, logout, forgotPassword, verifyResetOtp, resetPassword };
