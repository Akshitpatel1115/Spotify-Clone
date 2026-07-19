const jwt = require("jsonwebtoken");

function authArtist(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized Access",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "artist") {
      return res.status(403).json({
        message: "You don't have access.",
      });
    }

    req.user = decoded;

    next();
  } catch (err) {
    console.error("Token generation error:", err);
    return res.status(401).json({
      message: "Unauthorized Access",
    });
  }
}

function authUser(req, res, next) {

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized Access",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "user" && decoded.role !== "artist") {
      return res.status(403).json({
        message: "You don't have access.",
      });
    }

    req.user = decoded;

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({
      message: "Unauthorized Access",
    });
  }
}

module.exports = { authArtist, authUser };
