
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// =====================================
// REGISTER USER
// =====================================

const register = async (req, res) => {
  try {
    const { name, email, username, password } = req.body || {};

    // Validate required fields
    if (!name || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, username and password are required.",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    // Check whether email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Check whether username already exists
    const existingUsername = await prisma.user.findFirst({
      where: { username: username.trim() },
    });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "This username is already taken.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        username: username.trim(),
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user,
    });

  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed.",
    });
  }
};

// =====================================
// LOGIN USER
// =====================================

const login = async (req, res) => {
  try {
    // Read email and password from request
    const { email, password } = req.body || {};

    // Validate input
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from backend .env");
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return successful response
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
};

// =====================================
// GET LOGGED-IN USER PROFILE
// =====================================

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("Profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve profile.",
    });
  }
};

// =====================================
// EXPORT FUNCTIONS
// =====================================

module.exports = {
  register,
  login,
  getProfile,
};
