
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

// Import route files
const authRoutes = require("./routes/authRoutes");
const clothingRoutes = require("./routes/clothingRoutes");

const app = express();
const prisma = new PrismaClient();

// ===============================
// MIDDLEWARE
// ===============================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Wardrobe API is running!",
  });
});

// API health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is working correctly",
  });
});

// ===============================
// API ROUTES
// ===============================

// Authentication routes
app.use("/api/auth", authRoutes);

// Clothing routes
app.use("/api/clothes", clothingRoutes);

// ===============================
// 404 - ROUTE NOT FOUND
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    requestedUrl: req.originalUrl,
    method: req.method,
  });
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();

    console.log("PostgreSQL connected successfully!");

    const server = app.listen(PORT, () => {
      console.log(`Smart Wardrobe server running on port ${PORT}`);
      console.log(`Local URL: http://localhost:${PORT}`);
      console.log(`Health URL: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    async function shutdown() {
      console.log("Shutting down server...");

      server.close(async () => {
        await prisma.$disconnect();
        console.log("Database disconnected.");
        process.exit(0);
      });
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (error) {
    console.error("Unable to start server:", error);

    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
