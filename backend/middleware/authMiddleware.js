
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("\n--- AUTHENTICATION CHECK ---");
  console.log("URL:", req.originalUrl);
  console.log("Method:", req.method);
  console.log("Authorization header exists:", !!req.headers.authorization);

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("RESULT: Authorization header missing");

      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log("RESULT: Invalid Bearer format");

      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      console.log("RESULT: Empty token");

      return res.status(401).json({
        success: false,
        message: "Authentication token missing.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.log("RESULT: JWT_SECRET missing");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
    };

    console.log("RESULT: AUTH SUCCESS");
    console.log("USER ID:", req.user.userId);

    next();
  } catch (error) {
    console.log("RESULT: AUTHENTICATION FAILED");
    console.log("ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

module.exports = authMiddleware;
