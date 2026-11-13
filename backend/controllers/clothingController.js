
const { PrismaClient } = require("@prisma/client");
const cloudinary = require("../config/cloudinary");
const { extractClothing } = require("../services/clothingSegmentation");

const prisma = new PrismaClient();

// Upload processed clothing image to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "smart-wardrobe/clothing",
        resource_type: "image",
        format: "png",
        quality: "auto",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

// CREATE: Upload clothing item
const uploadClothing = async (req, res) => {
  let uploadedImage = null;

  try {
    console.log("UPLOAD CONTROLLER REACHED");
    console.log("Authenticated user:", req.user);

    // Verify authenticated user
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userId = Number(req.user.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid authenticated user.",
      });
    }

    // Verify uploaded file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a clothing image.",
      });
    }

    const {
      name,
      category,
      color,
      season,
      occasion,
      description,
    } = req.body;

    if (!name || !category || !color) {
      return res.status(400).json({
        success: false,
        message: "Name, category, and color are required.",
      });
    }

    // Process image using clothing segmentation
    console.log("Starting clothing segmentation...");

    const processedImage = await extractClothing(req.file.buffer);

    if (!processedImage || !Buffer.isBuffer(processedImage)) {
      throw new Error("Clothing segmentation did not return a valid image.");
    }

    console.log("Clothing segmentation completed.");

    // Upload processed image to Cloudinary
    uploadedImage = await uploadToCloudinary(processedImage);

    console.log("Image uploaded to Cloudinary.");

    // Save clothing details in PostgreSQL
    const clothing = await prisma.clothingItem.create({
      data: {
        name,
        category,
        color,
        season: season || null,
        occasion: occasion || null,
        description: description || null,
        imageUrl: uploadedImage.secure_url,
        imagePublicId: uploadedImage.public_id,
        userId: userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Clothing item uploaded successfully.",
      clothing,
    });

  } catch (error) {
    console.error("UPLOAD CLOTHING ERROR:", error);

    // Remove Cloudinary image if database saving failed
    if (uploadedImage && uploadedImage.public_id) {
      try {
        await cloudinary.uploader.destroy(uploadedImage.public_id);
      } catch (cleanupError) {
        console.error("Cloudinary cleanup error:", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload clothing item.",
    });
  }
};

// READ: Get all clothing items belonging to logged-in user
const getClothes = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userId = Number(req.user.userId);

    const clothes = await prisma.clothingItem.findMany({
      where: {
        userId: userId,
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
    console.error("GET CLOTHES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve clothing items.",
    });
  }
};

// DELETE: Delete a clothing item
const deleteClothing = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userId = Number(req.user.userId);
    const clothingId = Number(req.params.id);

    if (!Number.isInteger(clothingId) || clothingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid clothing item ID.",
      });
    }

    // Only find items belonging to the logged-in user
    const clothing = await prisma.clothingItem.findFirst({
      where: {
        id: clothingId,
        userId: userId,
      },
    });

    if (!clothing) {
      return res.status(404).json({
        success: false,
        message: "Clothing item not found.",
      });
    }

    // Delete image from Cloudinary
    if (clothing.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(clothing.imagePublicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
      }
    }

    // Delete database record
    await prisma.clothingItem.delete({
      where: {
        id: clothingId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Clothing item deleted successfully.",
    });

  } catch (error) {
    console.error("DELETE CLOTHING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete clothing item.",
    });
  }
};

module.exports = {
  uploadClothing,
  getClothes,
  deleteClothing,
};
