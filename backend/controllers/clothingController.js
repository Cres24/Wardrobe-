
const { PrismaClient } = require("@prisma/client");
const cloudinary = require("../config/cloudinary");
const {
  extractClothing,
} = require("../services/clothingSegmentation");

const prisma = new PrismaClient();

/**
 * Upload processed clothing image to Cloudinary.
 * Only the extracted transparent PNG is uploaded.
 */
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "smart-wardrobe/clothing",
        resource_type: "image",
        format: "png",
        transformation: [
          {
            quality: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * UPLOAD CLOTHING
 * 1. Receive original photograph.
 * 2. Extract clothing using AI.
 * 3. Remove background.
 * 4. Upload transparent PNG to Cloudinary.
 * 5. Save clothing details in PostgreSQL.
 */
const uploadClothing = async (req, res) => {
  let uploadedImage = null;

  try {
    // Check authentication.
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // Check uploaded image.
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a clothing photograph.",
      });
    }

    // Get clothing information.
    const {
      name,
      category,
      color,
      season,
      occasion,
      description,
    } = req.body;

    // Validate required fields.
    if (
      !name?.trim() ||
      !category?.trim() ||
      !color?.trim()
    ) {
      return res.status(400).json({
        message: "Name, category and color are required.",
      });
    }

    // Validate image type.
    const allowedTypes = [
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Only JPG and PNG images are supported.",
      });
    }

    console.log("Starting AI clothing extraction...");

    // STEP 1: Extract clothing using AI.
    const processedBuffer = await extractClothing(
      req.file.buffer
    );

    if (
      !Buffer.isBuffer(processedBuffer) ||
      processedBuffer.length === 0
    ) {
      throw new Error(
        "AI failed to generate the extracted clothing image."
      );
    }

    console.log("AI clothing extraction completed.");

    // STEP 2: Upload processed transparent PNG.
    console.log("Uploading extracted clothing to Cloudinary...");

    uploadedImage = await uploadToCloudinary(
      processedBuffer
    );

    if (!uploadedImage || !uploadedImage.secure_url) {
      throw new Error(
        "Cloudinary did not return a valid image URL."
      );
    }

    console.log("Cloudinary upload successful.");

    // STEP 3: Save clothing information in PostgreSQL.
    const clothing = await prisma.clothingItem.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        color: color.trim(),

        season: season?.trim() || null,
        occasion: occasion?.trim() || null,
        description: description?.trim() || null,

        imageUrl: uploadedImage.secure_url,
        imagePublicId: uploadedImage.public_id,

        userId: req.user.id,
      },
    });

    console.log("Clothing saved successfully.");

    // STEP 4: Return successful response.
    return res.status(201).json({
      success: true,
      message: "Clothing extracted and saved successfully!",
      clothing,
    });

  } catch (error) {
    console.error(
      "Clothing upload error:",
      error.message
    );

    // If Cloudinary upload succeeded but database
    // saving failed, remove the uploaded image.
    if (uploadedImage?.public_id) {
      try {
        await cloudinary.uploader.destroy(
          uploadedImage.public_id,
          {
            resource_type: "image",
          }
        );

        console.log(
          "Temporary Cloudinary image deleted."
        );

      } catch (cleanupError) {
        console.error(
          "Cloudinary cleanup error:",
          cleanupError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to extract and save clothing.",
    });
  }
};

/**
 * GET ALL CLOTHING
 * Returns clothing belonging to the logged-in user.
 */
const getClothes = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const clothes = await prisma.clothingItem.findMany({
      where: {
        userId: req.user.id,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: clothes.length,
      clothes,
    });

  } catch (error) {
    console.error(
      "Get clothes error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your wardrobe.",
    });
  }
};

/**
 * DELETE CLOTHING
 * Deletes the image from Cloudinary and the record
 * from PostgreSQL.
 */
const deleteClothing = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const { id } = req.params;

    // Find item belonging to logged-in user.
    const clothing = await prisma.clothingItem.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!clothing) {
      return res.status(404).json({
        message: "Clothing item not found.",
      });
    }

    // Delete the database record first so a Cloudinary
    // failure does not leave the item in the wardrobe.
    await prisma.clothingItem.delete({
      where: {
        id: clothing.id,
      },
    });

    // Delete image from Cloudinary.
    if (clothing.imagePublicId) {
      try {
        const result = await cloudinary.uploader.destroy(
          clothing.imagePublicId,
          {
            resource_type: "image",
          }
        );

        if (result.result !== "ok" &&
            result.result !== "not found") {
          console.error(
            "Cloudinary deletion was not confirmed:",
            result
          );
        }

      } catch (cloudinaryError) {
        console.error(
          "Cloudinary image deletion failed:",
          cloudinaryError.message
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Clothing deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Delete clothing error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to delete clothing.",
    });
  }
};

module.exports = {
  uploadClothing,
  getClothes,
  deleteClothing,
};
