const userModel = require("../models/user.model");
const PendingUser = require("../models/pendingUser.model");

async function checkAuthBlock(req, res, next) {
  try {
    const { email, username } = req.body;
    if (!email && !username) {
      return next();
    }

    let user = null;
    let pendingUser = null;

    if (email) {
      user = await userModel.findOne({ email });
      pendingUser = await PendingUser.findOne({ email });
    } else if (username) {
      user = await userModel.findOne({ username });
      pendingUser = await PendingUser.findOne({ username });
    }

    const processBlock = async (entity) => {
      if (!entity || !entity.authBlock || !entity.authBlock.isBlocked) {
        return { blocked: false };
      }

      const { blockedUntil, reason } = entity.authBlock;

      if (blockedUntil && blockedUntil > new Date()) {
        const remainingMs = blockedUntil.getTime() - Date.now();
        const remainingSeconds = Math.ceil(remainingMs / 1000);

        let timeStr = "";
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;

        if (minutes > 0 && seconds > 0) {
          timeStr = `${minutes} minute${minutes > 1 ? "s" : ""} ${seconds} second${seconds > 1 ? "s" : ""}`;
        } else if (minutes > 0) {
          timeStr = `${minutes} minute${minutes > 1 ? "s" : ""}`;
        } else {
          timeStr = `${seconds} second${seconds > 1 ? "s" : ""}`;
        }

        const messageReason =
          reason === "LOGIN_SECURITY"
            ? "Too many failed login attempts"
            : "Authentication is temporarily blocked";

        return {
          blocked: true,
          message: `${messageReason}. Please try again in ${timeStr}.`,
          remainingSeconds,
        };
      } else {
        // Block expired, clean it up!
        entity.authBlock = {
          isBlocked: false,
          reason: undefined,
          blockedUntil: undefined,
        };
        if (entity.loginAttempts !== undefined) entity.loginAttempts = 0;
        if (entity.otpAttempts !== undefined) entity.otpAttempts = 0;
        if (entity.resetPasswordOtpAttempts !== undefined) entity.resetPasswordOtpAttempts = 0;
        
        await entity.save();
        return { blocked: false };
      }
    };

    if (user) {
      const result = await processBlock(user);
      if (result.blocked) {
        return res.status(423).json({
          success: false,
          message: result.message,
          remainingSeconds: result.remainingSeconds,
        });
      }
    }

    if (pendingUser) {
      const result = await processBlock(pendingUser);
      if (result.blocked) {
        return res.status(423).json({
          success: false,
          message: result.message,
          remainingSeconds: result.remainingSeconds,
        });
      }
    }

    next();
  } catch (error) {
    console.error("[AuthBlock Middleware] Error:", error);
    return res.status(500).json({ message: "Internal server error during security check." });
  }
}

module.exports = checkAuthBlock;
