
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const authRoutes = require("./routes/authRoutes");
const clothingRoutes = require("./routes/clothingRoutes");

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;

// 1. CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// 2. Parse incoming request data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Request logger (helps debug API routes)
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.originalUrl);
  next();
});

// 4. Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Smart Wardrobe API is running",
  });
});

// 5. Health check
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Server and database are connected",
      database: "Connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      database: "Disconnected",
    });
  }
});

// 6. Authentication routes
app.use("/api/auth", authRoutes);

// 7. Clothing routes
app.use("/api/clothes", clothingRoutes);

// 8. Handle unknown API routes
app.use((req, res) => {
  console.log("ROUTE NOT FOUND:", req.method, req.originalUrl);

  res.status(404).json({
    success: false,
    message: "API route not found",
    requestedUrl: req.originalUrl,
    method: req.method,
  });
});

// 9. Global error handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// 10. Start server
async function startServer() {
  try {
    await prisma.$connect();

    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// 11. Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// 12. Export the Express app for serverless platforms (Vercel).
// Only start a standalone listener when this file is run directly.
module.exports = app;

if (require.main === module) {
  startServer();
}
