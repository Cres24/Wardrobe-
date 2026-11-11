
const express = require("express");
const router = express.Router();

const {
  uploadClothing,
  getClothes,
  deleteClothing,
} = require("../controllers/clothingController");

const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");

// All clothing routes require authentication
router.use(authMiddleware);

// Upload a clothing item
// POST /api/clothes
router.post("/", uploadMiddleware.single("image"), uploadClothing);

// Get all clothing items belonging to the logged-in user
// GET /api/clothes
router.get("/", getClothes);

// Delete a clothing item
// DELETE /api/clothes/:id
router.delete("/:id", deleteClothing);

module.exports = router;
