
import { useEffect, useState } from "react";
import { ImagePlus, Upload, X, CheckCircle } from "lucide-react";
import api from "../services/api";

const initialForm = {
  name: "",
  category: "",
  color: "",
  season: "",
  occasion: "",
  description: "",
};

function UploadClothes({ onUploaded }) {
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    setError("");
    setSuccess("");

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, JPEG or PNG image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!image) {
      setError("Please select a clothing image.");
      return;
    }

    if (!form.name || !form.category || !form.color) {
      setError("Please fill in the required fields.");
      return;
    }

    const formData = new FormData();

    formData.append("image", image);

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      setLoading(true);

      const response = await api.post(
        "/clothes/upload",
        formData
      );

      setSuccess(response.data.message);

      setForm(initialForm);
      setImage(null);
      setPreview("");

      const fileInput = document.getElementById("clothing-image");

      if (fileInput) fileInput.value = "";

      if (onUploaded) {
        onUploaded(response.data.clothing);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to upload clothing. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500";

  const labelClass =
    "block text-sm text-slate-300 mb-2";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Add Clothing
        </h1>

        <p className="text-slate-400 mt-2">
          Add a new item to your digital wardrobe.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6"
      >
        <div>
          <label className={labelClass}>
            Clothing Image *
          </label>

          <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-violet-500 transition">
            {preview ? (
              <div className="relative max-w-sm mx-auto">
                <img
                  src={preview}
                  alt="Clothing preview"
                  className="w-full h-72 object-contain rounded-xl bg-slate-950"
                />

                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setPreview("");
                    const input = document.getElementById("clothing-image");
                    if (input) input.value = "";
                  }}
                  className="absolute top-2 right-2 bg-red-600 rounded-full p-2"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <label
                htmlFor="clothing-image"
                className="cursor-pointer block py-10"
              >
                <ImagePlus
                  size={45}
                  className="mx-auto text-violet-400 mb-4"
                />

                <p className="font-medium">
                  Click to upload clothing image
                </p>

                <p className="text-xs text-slate-500 mt-2">
                  JPG, JPEG or PNG · Maximum 5 MB
                </p>
              </label>
            )}

            <input
              id="clothing-image"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            Clothing Name *
          </label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. White Cotton T-shirt"
            className={inputClass}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>
              Category *
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select category</option>
              <option value="T-Shirts">T-Shirts</option>
              <option value="Shirts">Shirts</option>
              <option value="Pants">Pants</option>
              <option value="Jeans">Jeans</option>
              <option value="Shorts">Shorts</option>
              <option value="Jackets">Jackets</option>
              <option value="Hoodies">Hoodies</option>
              <option value="Sweaters">Sweaters</option>
              <option value="Shoes">Shoes</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Color *
            </label>

            <select
              name="color"
              value={form.color}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select color</option>
              {[
                "Black",
                "White",
                "Blue",
                "Red",
                "Green",
                "Yellow",
                "Grey",
                "Brown",
                "Beige",
                "Pink",
                "Purple",
                "Orange",
                "Multicolor",
              ].map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Season
            </label>

            <select
              name="season"
              value={form.season}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select season</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
              <option value="Monsoon">Monsoon</option>
              <option value="All-season">All-season</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Occasion
            </label>

            <select
              name="occasion"
              value={form.occasion}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select occasion</option>
              <option value="Casual">Casual</option>
              <option value="Formal">Formal</option>
              <option value="Party">Party</option>
              <option value="Sports">Sports</option>
              <option value="Office">Office</option>
              <option value="Travel">Travel</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            placeholder="Additional details about this clothing item..."
            className={inputClass}
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 text-sm flex items-center gap-2">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl py-4 font-semibold flex items-center justify-center gap-2"
        >
          <Upload size={19} />
          {loading ? "Uploading..." : "Save to My Wardrobe"}
        </button>
      </form>
    </div>
  );
}

export default UploadClothes;
