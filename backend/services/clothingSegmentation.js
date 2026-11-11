
const sharp = require("sharp");

const MODEL_URL =
  "https://router.huggingface.co/hf-inference/models/mattmdjaga/segformer_b2_clothes";

// Garment labels from the model.
// Excludes skin, face, hair and other body parts.
const CLOTHING_LABELS = new Set([
  "upper-clothes",
  "skirt",
  "pants",
  "dress",
  "belt",
  "left-shoe",
  "right-shoe",
  "hat",
  "scarf",
]);

function decodeMask(mask) {
  if (!mask || typeof mask !== "string") {
    throw new Error("AI returned an invalid clothing mask.");
  }

  const base64 = mask.replace(
    /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
    ""
  );

  return Buffer.from(base64, "base64");
}

async function extractClothing(imageBuffer) {
  if (!process.env.HF_TOKEN) {
    throw new Error("HF_TOKEN is missing from backend .env");
  }

  const original = sharp(imageBuffer).rotate();

  const metadata = await original.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read the uploaded image.");
  }

  // Send original image bytes to Hugging Face.
  const response = await fetch(MODEL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
      "Content-Type": "application/octet-stream",
      Accept: "application/json",
    },
    body: imageBuffer,
  });

  if (!response.ok) {
    const details = await response.text();

    throw new Error(
      `Clothing AI failed (${response.status}): ${details.slice(0, 500)}`
    );
  }

  const segments = await response.json();

  if (!Array.isArray(segments)) {
    throw new Error("The AI returned an unexpected response.");
  }

  // Select only clothing categories.
  const clothingSegments = segments.filter(
    (segment) =>
      CLOTHING_LABELS.has(
        String(segment.label || "").toLowerCase()
      ) &&
      Number(segment.score) >= 0.30 &&
      segment.mask
  );

  if (clothingSegments.length === 0) {
    throw new Error(
      "No clothing was detected. Please try a clearer photograph."
    );
  }

  const width = metadata.width;
  const height = metadata.height;

  // Create a combined alpha mask.
  const combinedMask = Buffer.alloc(width * height, 0);

  for (const segment of clothingSegments) {
    const maskBuffer = decodeMask(segment.mask);

    const { data } = await sharp(maskBuffer)
      .resize(width, height, {
        fit: "fill",
      })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Merge masks, retaining the strongest mask value.
    for (let i = 0; i < combinedMask.length; i++) {
      if (data[i] > combinedMask[i]) {
        combinedMask[i] = data[i];
      }
    }
  }

  // Reject extremely small detections.
  const visiblePixels = combinedMask.reduce(
    (total, value) => total + (value > 127 ? 1 : 0),
    0
  );

  const visibleRatio = visiblePixels / (width * height);

  if (visibleRatio < 0.005) {
    throw new Error(
      "The detected clothing area is too small. Try another photograph."
    );
  }

  // Create a PNG alpha channel from the mask.
  const alphaBuffer = await sharp(combinedMask, {
    raw: {
      width,
      height,
      channels: 1,
    },
  })
    .png()
    .toBuffer();

  // Apply the mask to the original photograph.
  // The result has a transparent background.
  const extracted = await sharp(imageBuffer)
    .rotate()
    .removeAlpha()
    .joinChannel(alphaBuffer)
    .png()
    .toBuffer();

  // Trim empty transparent borders.
  const trimmed = await sharp(extracted)
    .trim({
      background: {
        r: 0,
        g: 0,
        b: 0,
        alpha: 0,
      },
    })
    .png()
    .toBuffer();

  return trimmed;
}

module.exports = { extractClothing };
