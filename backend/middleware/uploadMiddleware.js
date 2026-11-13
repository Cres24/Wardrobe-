const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only JPG, JPEG and PNG images are allowed.")
    );
  }
};

const upload = multer({
  storage,
  limits: {
    // Vercel Functions reject request bodies larger than 4.5 MB.
    fileSize: 4 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = upload;