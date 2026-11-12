
import React, { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function UploadClothes() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    color: "",
    season: "",
    occasion: "",
    description: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Clean up image preview URL when it changes or component unmounts
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const selectedImage = e.target.files?.[0];

    setError("");
    setMessage("");

    if (!selectedImage) {
      setImage(null);
      setPreview("");
      return;
    }

    if (!["image/jpeg", "image/png"].includes(selectedImage.type)) {
      setError("Please select a JPG or PNG image.");
      e.target.value = "";
      setImage(null);
      setPreview("");
      return;
    }

    if (selectedImage.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10 MB.");
      e.target.value = "";
      setImage(null);
      setPreview("");
      return;
    }

    setImage(selectedImage);
    setPreview(URL.createObjectURL(selectedImage));
  };

  // Upload clothing to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!image) {
      setError("Please select a clothing image.");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.category ||
      !formData.color.trim()
    ) {
      setError("Please enter the clothing name, category, and color.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in. Please log in again.");
      return;
    }

    // Create multipart form data
    const uploadData = new FormData();

    uploadData.append("image", image);
    uploadData.append("name", formData.name.trim());
    uploadData.append("category", formData.category);
    uploadData.append("color", formData.color.trim());
    uploadData.append("season", formData.season);
    uploadData.append("occasion", formData.occasion);
    uploadData.append("description", formData.description.trim());

    try {
      setLoading(true);

      // IMPORTANT: Correct endpoint is /clothes, NOT /clothes/upload
      const response = await fetch(`${API_URL}/clothes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to upload clothing."
        );
      }

      setMessage(
        result.message || "Clothing uploaded successfully!"
      );

      // Reset form after successful upload
      setFormData({
        name: "",
        category: "",
        color: "",
        season: "",
        occasion: "",
        description: "",
      });

      setImage(null);
      setPreview("");

      const fileInput = document.getElementById("clothing-image");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error("Clothing upload error:", err);
      setError(err.message || "Something went wrong during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Add Clothing
          </h1>

          <p className="mt-2 text-gray-500">
            Upload a clothing item to your personal wardrobe.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-white p-5 shadow-sm sm:p-8"
        >

          {/* Image upload */}
          <div>
            <label className="mb-3 block font-semibold text-gray-700">
              Clothing Image
            </label>

            <div className="rounded-xl border-2 border-dashed border-gray-300 p-5 text-center">

              {preview ? (
                <div className="mb-4">
                  <img
                    src={preview}
                    alt="Clothing preview"
                    className="mx-auto max-h-72 rounded-lg object-contain"
                  />
                </div>
              ) : (
                <div className="py-8">
                  <div className="mb-3 text-4xl">📷</div>

                  <p className="font-medium text-gray-700">
                    Choose a clothing image
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    JPG or PNG, maximum 10 MB
                  </p>
                </div>
              )}

              <input
                id="clothing-image"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                className="mx-auto mt-3 block w-full max-w-xs text-sm text-gray-600"
              />
            </div>
          </div>

          {/* Clothing name */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Clothing Name *
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Blue Denim Jacket"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Category *
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">Select category</option>
              <option value="Tops">Tops</option>
              <option value="Shirts">Shirts</option>
              <option value="T-Shirts">T-Shirts</option>
              <option value="Pants">Pants</option>
              <option value="Jeans">Jeans</option>
              <option value="Shorts">Shorts</option>
              <option value="Skirts">Skirts</option>
              <option value="Dresses">Dresses</option>
              <option value="Jackets">Jackets</option>
              <option value="Coats">Coats</option>
              <option value="Shoes">Shoes</option>
              <option value="Accessories">Accessories</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Color *
            </label>

            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="e.g. Navy Blue"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Season */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Season
            </label>

            <select
              name="season"
              value={formData.season}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">Select season</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
              <option value="Spring">Spring</option>
              <option value="Autumn">Autumn</option>
              <option value="All Seasons">All Seasons</option>
            </select>
          </div>

          {/* Occasion */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Occasion
            </label>

            <select
              name="occasion"
              value={formData.occasion}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">Select occasion</option>
              <option value="Casual">Casual</option>
              <option value="Formal">Formal</option>
              <option value="Party">Party</option>
              <option value="Sports">Sports</option>
              <option value="Work">Work</option>
              <option value="Traditional">Traditional</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Additional details about this clothing item..."
              rows="4"
              className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Success message */}
          {message && (
            <div className="rounded-lg bg-green-100 p-4 text-sm text-green-700">
              {message}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-100 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Uploading Clothing..." : "Upload to Wardrobe"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default UploadClothes;
