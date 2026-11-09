import { useEffect, useState } from "react";
import { Trash2, Shirt, RefreshCw } from "lucide-react";
import api from "../services/api";

function Wardrobe() {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClothes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/clothes");

      setClothes(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your wardrobe."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClothes();
  }, []);

  const deleteClothing = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this clothing item?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/clothes/${id}`);

      setClothes((previous) =>
        previous.filter((item) => item.id !== id)
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to delete clothing."
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center text-slate-400 py-16">
        Loading your wardrobe...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            My Wardrobe
          </h1>
          <p className="text-slate-400 mt-2">
            All your uploaded clothing items.
          </p>
        </div>

        <button
          onClick={fetchClothes}
          className="bg-slate-800 p-3 rounded-xl hover:bg-slate-700"
          title="Refresh wardrobe"
        >
          <RefreshCw size={19} />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="mb-6 text-sm text-slate-400">
        Total clothing items: {clothes.length}
      </div>

      {clothes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <Shirt
            size={50}
            className="mx-auto text-slate-600 mb-4"
          />

          <h2 className="text-xl font-semibold">
            Your wardrobe is empty
          </h2>

          <p className="text-slate-400 mt-2">
            Upload your first clothing item to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clothes.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-64 object-cover bg-slate-800"
              />

              <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-semibold">
                      {item.name}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      {item.category}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteClothing(item.id)}
                    className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg"
                    title="Delete clothing"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-xs bg-slate-800 px-3 py-1 rounded-full">
                    {item.color}
                  </span>

                  {item.season && (
                    <span className="text-xs bg-slate-800 px-3 py-1 rounded-full">
                      {item.season}
                    </span>
                  )}

                  {item.occasion && (
                    <span className="text-xs bg-slate-800 px-3 py-1 rounded-full">
                      {item.occasion}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wardrobe;