
import React, { useEffect, useState } from "react";
import { Upload, ImagePlus, Loader2, CheckCircle } from "lucide-react";
import api from "../services/api";

export default function UploadClothes({ onUploaded }) {
  const [form, setForm] = useState({
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

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];

    setError("");
    setMessage("");

    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Please select a JPG or PNG image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!image) {
      setError("Please select a clothing photograph.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      data.append("image", image);

      const response = await api.post(
        "/clothes/upload",
        data
      );

      setMessage(
        response.data.message ||
        "Clothing extracted successfully!"
      );

      setForm({
        name: "",
        category: "",
        color: "",
        season: "",
        occasion: "",
        description: "",
      });

      setImage(null);

      if (onUploaded) {
        setTimeout(() => onUploaded(), 1200);
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to process the clothing image."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-7">
        <h2 className="text-2xl sm:text-3xl font-bold">
          Add Clothing
        </h2>

        <p className="text-gray-400 text-sm mt-2">
          Upload a photograph. AI will automatically
          isolate the clothing before saving it.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#151520] border border-[#292939] rounded-2xl p-5 sm:p-7 space-y-5"
      >
        <div>
          <label className="form-label">
            Clothing photograph
          </label>

          <label className="flex flex-col items-center justify-center min-h-52 border-2 border-dashed border-purple-500/40 rounded-xl cursor-pointer hover:bg-purple-500/5 transition p-5 text-center">
            {preview ? (
              <img
                src={preview}
                alt="Original clothing preview"
                className="max-h-64 max-w-full object-contain rounded-lg"
              />
            ) : (
              <>
                <ImagePlus
                  size={42}
                  className="text-purple-400 mb-3"
                />

                <span className="font-semibold">
                  Choose a photograph
                </span>

                <span className="text-xs text-gray-500 mt-2">
                  JPG or PNG · Maximum 5 MB
                </span>
              </>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleImage}
            />
          </label>

          <p className="text-xs text-gray-500 mt-2">
            Flat-lay, hanger and worn-clothing photos
            are supported as input types, but extraction
            accuracy may vary.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              Clothing name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Blue Denim Jacket"
              required
              className="w-full bg-[#0c0c14] border border-[#303041] rounded-xl p-3 text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="form-label">
              Category
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full bg-[#0c0c14] border border-[#303041] rounded-xl p-3 text-white outline-none focus:border-purple-500"
            >
              <option value="">Select category</option>
              <option value="Tops">Tops</option>
              <option value="Shirts">Shirts</option>
              <option value="Trousers">Trousers</option>
              <option value="Jeans">Jeans</option>
              <option value="Skirts">Skirts</option>
              <option value="Dresses">Dresses</option>
              <option value="Jackets">Jackets</option>
              <option value="Shoes">Shoes</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div>
            <label className="form-label">
              Color
            </label>

            <input
              name="color"
              value={form.color}
              onChange={handleChange}
              placeholder="e.g. Navy Blue"
              required
              className="w-full bg-[#0c0c14] border border-[#303041] rounded-xl p-3 text-white outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="form-label">
              Season
            </label>

            <select
              name="season"
              value={form.season}
              onChange={handleChange}
              className="w-full bg-[#0c0c14] border border-[#303041] rounded-xl p-3 text-white outline-none focus:border-purple-500"
            >
              <option value="">Select season</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
              <option value="Monsoon">Monsoon</option>
              <option value="All Season">All Season</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="form-label">
              Occasion
            </label>

            <select
              name="occasion"
              value={form.occasion}
              onChange={handleChange}
              className="w-full bg-[#0c0c14] border border-[#303041] rounded-xl p-3 text-white outline-none focus:border-purple-500"
            >
              <option value="">Select occasion</option>
              <option value="Casual">Casual</option>
              <option value="Formal">Formal</option>
              <option value="Party">Party</option>
              <option value="Sports">Sports</option>
              <option value="Traditional">Traditional</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="form-label">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              placeholder="Additional clothing details..."
              className="w-full bg-[#0c0c14] border border-[#303041] rounded-xl p-3 text-white outline-none focus:border-purple-500 resize-y"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-500/10 text-green-400 rounded-xl p-3 text-sm flex items-center gap-2">
            <CheckCircle size={18} />
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="primary-button w-full flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={19} className="animate-spin" />
              Extracting clothing with AI...
            </>
          ) : (
            <>
              <Upload size={19} />
              Extract and Save Clothing
            </>
          )}
        </button>
      </form>
    </div>
  );
}
