
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // 1. Check whether Authorization header exists
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("AUTH ERROR: Authorization header missing");

      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // 2. Check Bearer token format
    if (!authHeader.startsWith("Bearer ")) {
      console.log("AUTH ERROR: Invalid authorization format");

      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
    }

    // 3. Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      console.log("AUTH ERROR: Token missing");

      return res.status(401).json({
        success: false,
        message: "Authentication token missing.",
      });
    }

    // 4. Verify JWT
    if (!process.env.JWT_SECRET) {
      console.error("AUTH ERROR: JWT_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach authenticated user to request
    req.user = {
      userId: decoded.userId,
    };

    console.log("AUTH SUCCESS: User ID:", req.user.userId);

    // 6. Continue to requested route
    next();

  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

module.exports = authMiddleware;
