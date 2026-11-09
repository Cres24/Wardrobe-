
const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadClothing,
  getClothes,
  deleteClothing,
} = require("../controllers/clothingController");

router.post(
  "/upload",
  authenticate,
  upload.single("image"),
  uploadClothing
);

router.get("/", authenticate, getClothes);

router.delete("/:id", authenticate, deleteClothing);

module.exports = router;
