
import { useState } from "react";
import {
  Shirt,
  LayoutDashboard,
  ShoppingBag,
  LogOut,
  Plus,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "./context/AuthContext";
import UploadClothes from "./pages/UploadClothes";
import Wardrobe from "./pages/Wardrobe";

import api from "./services/api";

function App() {
  const { user, login, register, logout } = useAuth();

  const [page, setPage] = useState("Dashboard");
  const [showRegister, setShowRegister] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (showRegister) {
        await register(
          form.name,
          form.email,
          form.password
        );
      } else {
        await login(
          form.email,
          form.password
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Authentication failed."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-5">
        <form
          onSubmit={handleAuth}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8"
        >
          <div className="bg-violet-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
            <Shirt size={30} />
          </div>

          <h1 className="text-3xl font-bold">
            Wardrobe
          </h1>

          <p className="text-slate-400 mt-2 mb-8">
            {showRegister
              ? "Create your personal wardrobe."
              : "Welcome back to your wardrobe."}
          </p>

          {showRegister && (
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 mb-4 outline-none focus:border-violet-500"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 mb-4 outline-none focus:border-violet-500"
            required
          />

          <input
            type="password"
            placeholder="Password (minimum 8 characters)"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 mb-5 outline-none focus:border-violet-500"
            required
            minLength={8}
          />

          {error && (
            <p className="text-red-400 text-sm mb-4">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl p-4 font-semibold"
          >
            {loading
              ? "Please wait..."
              : showRegister
              ? "Create Account"
              : "Login"}
          </button>

          <p className="text-center text-sm text-slate-400 mt-6">
            {showRegister
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              onClick={() => {
                setShowRegister(!showRegister);
                setError("");
              }}
              className="text-violet-400 ml-2"
            >
              {showRegister ? "Login" : "Register"}
            </button>
          </p>
        </form>
      </div>
    );
  }

  const navigation = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Wardrobe",
      icon: ShoppingBag,
    },
    {
      name: "Upload Clothes",
      icon: Plus,
    },
  ];

  const handleLogout = () => {
    logout();
    setPage("Dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {mobileMenu && (
        <div
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col transform transition-transform lg:translate-x-0 ${
          mobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-12">
          <div className="flex gap-3 items-center">
            <div className="bg-violet-600 p-2 rounded-xl">
              <Shirt size={24} />
            </div>

            <span className="text-xl font-bold">
              wardrobe.
            </span>
          </div>

          <button
            onClick={() => setMobileMenu(false)}
            className="lg:hidden"
          >
            <X />
          </button>
        </div>

        <p className="text-xs text-slate-500 uppercase mb-4">
          Menu
        </p>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => {
                  setPage(item.name);
                  setMobileMenu(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm ${
                  page === item.name
                    ? "bg-violet-600"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-800 pt-5">
          <p className="text-sm font-semibold">
            {user.name}
          </p>

          <p className="text-xs text-slate-500 mt-1 mb-4">
            {user.email}
          </p>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-400 text-sm p-3 hover:bg-slate-800 rounded-xl w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-5 md:p-8">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenu(true)}
              className="lg:hidden"
            >
              <Menu size={25} />
            </button>

            <div>
              <p className="text-xs text-slate-500">
                Your personal space
              </p>

              <h1 className="text-2xl font-bold">
                {page}
              </h1>
            </div>
          </div>
        </header>

        {page === "Dashboard" && (
          <div>
            <div className="bg-gradient-to-r from-violet-700 to-indigo-700 rounded-3xl p-8 md:p-12 mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Welcome, {user.name}!
              </h2>

              <p className="text-violet-100 mb-7">
                Organize your clothes and discover new outfits.
              </p>

              <button
                onClick={() => setPage("Upload Clothes")}
                className="bg-white text-violet-700 px-6 py-3 rounded-xl font-semibold"
              >
                <Plus size={18} className="inline mr-2" />
                Upload Clothing
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <button
                onClick={() => setPage("My Wardrobe")}
                className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-left hover:border-violet-500"
              >
                <ShoppingBag
                  size={30}
                  className="text-violet-400 mb-4"
                />

                <h3 className="font-semibold text-lg">
                  My Wardrobe
                </h3>

                <p className="text-sm text-slate-400 mt-2">
                  View all your uploaded clothes.
                </p>
              </button>

              <button
                onClick={() => setPage("Upload Clothes")}
                className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-left hover:border-violet-500"
              >
                <Plus
                  size={30}
                  className="text-violet-400 mb-4"
                />

                <h3 className="font-semibold text-lg">
                  Add Clothing
                </h3>

                <p className="text-sm text-slate-400 mt-2">
                  Add a new item to your collection.
                </p>
              </button>
            </div>
          </div>
        )}

        {page === "Upload Clothes" && (
          <UploadClothes
            onUploaded={() => setPage("My Wardrobe")}
          />
        )}

        {page === "My Wardrobe" && (
          <Wardrobe />
        )}
      </main>
    </div>
  );
}

export default App;
