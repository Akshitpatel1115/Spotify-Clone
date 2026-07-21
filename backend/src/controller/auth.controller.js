const userModel = require("../models/user.model");
const PendingUser = require("../models/pendingUser.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendOTPEmail } = require("../utils/email");

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
      return res.status(400).json({ message: "All fields are required" });
    }

    // Step 2: Check Users Collection
    const isUserAlreadyExist = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserAlreadyExist) {
      return res.status(409).json({
        message: "User already exists. Please log in.",
      });
    }

    // Step 3: Check PendingUsers Collection
    const isUserPending = await PendingUser.findOne({ email });

    if (isUserPending) {
      // If resend is available, they can request a new one, but they cannot register again yet
      return res.status(409).json({
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
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const resendAvailableAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes (TTL)

    await PendingUser.create({
      username,
      email,
      password: hashedPassword,
      role,
      otp: hashedOtp,
      otpExpiresAt,
      resendAvailableAt,
      expiresAt
    });

    // Step 8: Send OTP email
    await sendOTPEmail(email, otp);

    // Step 9: Return success response
    return res.status(201).json({
      message: "Registration step 1 complete. OTP sent to your email.",
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Internal server error during registration." });
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
        message: "No pending registration found for this email. It may have expired.",
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
    return res.status(500).json({ message: "Internal server error during verification." });
  }
}

module.exports = { register, verifyEmail, login, logout };
