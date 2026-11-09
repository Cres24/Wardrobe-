
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const authRoutes = require("./routes/authRoutes");
const clothingRoutes = require("./routes/clothingRoutes");

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Smart Wardrobe API is running",
  });
});

// Check database connection
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "OK",
      database: "Connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(503).json({
      status: "ERROR",
      database: "Disconnected",
    });
  }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/clothes", clothingRoutes);

// Handle upload errors
app.use((error, req, res, next) => {
  console.error("API error:", error);

  if (error instanceof require("multer").MulterError) {
    return res.status(400).json({
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Image must be smaller than 5 MB."
          : error.message,
    });
  }

  if (
    error.message ===
    "Only JPG, JPEG and PNG images are allowed."
  ) {
    return res.status(400).json({
      message: error.message,
    });
  }

  res.status(500).json({
    message: "Internal server error.",
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Smart Wardrobe API running on port ${PORT}`);
});

async function shutdown() {
  await prisma.$disconnect();
  server.close();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
