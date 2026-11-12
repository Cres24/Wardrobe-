
const express = require("express");
const router = express.Router();

const {
  uploadClothing,
  getClothes,
  deleteClothing,
} = require("../controllers/clothingController");

const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");

// Authentication must run before upload handling
router.use(authMiddleware);

router.post("/", uploadMiddleware.single("image"), uploadClothing);
router.get("/", getClothes);
router.delete("/:id", deleteClothing);

module.exports = router;
