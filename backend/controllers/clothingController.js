const { PrismaClient } = require("@prisma/client");
const cloudinary = require("../config/cloudinary");

const prisma = new PrismaClient();

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "smart-wardrobe",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// Upload clothing
const uploadClothing = async (req, res) => {
  let uploadedImage;

  try {
    const {
      name,
      category,
      color,
      season,
      occasion,
      description,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image.",
      });
    }

    if (!name || !category || !color) {
      return res.status(400).json({
        message: "Name, category and color are required.",
      });
    }

    // Upload image to Cloudinary
    uploadedImage = await uploadToCloudinary(
      req.file.buffer
    );

    // Save clothing details to PostgreSQL
    const clothing = await prisma.clothingItem.create({
      data: {
        name: name.trim(),
        category,
        color,
        season: season || null,
        occasion: occasion || null,
        description: description || null,

        imageUrl: uploadedImage.secure_url,
        imagePublicId: uploadedImage.public_id,

        userId: req.user.id,
      },
    });

    return res.status(201).json({
      message: "Clothing uploaded successfully.",
      clothing,
    });
  } catch (error) {
    console.error("Clothing upload error:", error);

    // Clean up image if database insertion failed
    if (uploadedImage?.public_id) {
      try {
        await cloudinary.uploader.destroy(
          uploadedImage.public_id
        );
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError);
      }
    }

    return res.status(500).json({
      message: "Failed to upload clothing.",
    });
  }
};

// Get all clothing belonging to logged-in user
const getClothes = async (req, res) => {
  try {
    const clothes = await prisma.clothingItem.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(clothes);
  } catch (error) {
    console.error("Fetch clothing error:", error);

    return res.status(500).json({
      message: "Unable to retrieve clothing.",
    });
  }
};

// Delete clothing
const deleteClothing = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid clothing ID.",
      });
    }

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

    if (clothing.imagePublicId) {
      await cloudinary.uploader.destroy(
        clothing.imagePublicId
      );
    }

    await prisma.clothingItem.delete({
      where: { id },
    });

    return res.json({
      message: "Clothing deleted successfully.",
    });
  } catch (error) {
    console.error("Delete clothing error:", error);

    return res.status(500).json({
      message: "Unable to delete clothing.",
    });
  }
};

module.exports = {
  uploadClothing,
  getClothes,
  deleteClothing,
};