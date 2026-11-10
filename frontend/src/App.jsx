
import React, { useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Shirt,
  Upload,
  LogOut,
  User,
  Sparkles,
  Heart,
  Search,
  ArrowRight,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";

import { useAuth } from "./context/AuthContext";
import UploadClothes from "./pages/UploadClothes";
import Wardrobe from "./pages/Wardrobe";

function App() {
  const { user, login, register, logout } = useAuth();

  const [page, setPage] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleInput = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (authMode === "register") {
        if (form.password !== form.confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        await register({
          name: form.name,
          email: form.email,
          username: form.username,
          password: form.password,
        });
      } else {
        await login({
          email: form.email,
          password: form.password,
        });
      }

      setPage("dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const navigate = (destination) => {
    setPage(destination);
    setMobileMenu(false);
  };

  const navigation = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      page: "dashboard",
    },
    {
      name: "My Wardrobe",
      icon: Shirt,
      page: "wardrobe",
    },
    {
      name: "Upload Clothes",
      icon: Upload,
      page: "upload",
    },
  ];

  if (!user) {
    return (
      <div className="auth-background min-h-screen flex items-center justify-center px-4 py-10">
        <div className="auth-card w-full max-w-md rounded-3xl p-6 sm:p-9">
          <div className="text-center mb-8">
            <div className="logo-icon mx-auto mb-4">
              <Shirt size={30} />
            </div>

            <h1 className="text-3xl font-bold text-white">
              Smart Wardrobe
            </h1>

            <p className="text-gray-400 mt-2">
              Your personal fashion assistant
            </p>
          </div>

          <div className="grid grid-cols-2 bg-gray-900 rounded-xl p-1 mb-7">
            <button
              onClick={() => {
                setAuthMode("login");
                setError("");
              }}
              className={`py-3 rounded-lg transition ${
                authMode === "login"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400"
              }`}
            >
              Login
            </button>

            <button
              onClick={() => {
                setAuthMode("register");
                setError("");
              }}
              className={`py-3 rounded-lg transition ${
                authMode === "register"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === "register" && (
              <>
                <div>
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <UserRound size={18} />
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleInput}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Username</label>
                  <div className="input-wrapper">
                    <User size={18} />
                    <input
                      name="username"
                      value={form.username}
                      onChange={handleInput}
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInput}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleInput}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {authMode === "register" && (
              <div>
                <label className="form-label">
                  Confirm Password
                </label>
                <div className="input-wrapper">
                  <Lock size={18} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleInput}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="primary-button w-full"
            >
              {loading
                ? "Please wait..."
                : authMode === "login"
                ? "Login to your account"
                : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Organize your style. Simplify your life.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout min-h-screen text-white">
      {/* Mobile Header */}
      <header className="mobile-header lg:hidden">
        <div className="flex items-center gap-3">
          <div className="logo-small">
            <Shirt size={21} />
          </div>
          <span className="font-bold text-lg">Smart Wardrobe</span>
        </div>

        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="icon-button"
          aria-label="Toggle navigation"
        >
          {mobileMenu ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileMenu && (
        <div
          className="mobile-overlay lg:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${
          mobileMenu ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="logo-small">
            <Shirt size={23} />
          </div>

          <div>
            <h2 className="font-bold text-lg">Smart Wardrobe</h2>
            <p className="text-xs text-gray-500">
              Your personal stylist
            </p>
          </div>

          <button
            onClick={() => setMobileMenu(false)}
            className="ml-auto lg:hidden"
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>

        <div className="mt-9">
          <p className="sidebar-heading">MENU</p>

          <nav className="space-y-2 mt-3">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.page}
                  onClick={() => navigate(item.page)}
                  className={`nav-item ${
                    page === item.page ? "nav-active" : ""
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto pt-8">
          <div className="profile-card">
            <div className="profile-avatar">
              {(user.name || user.username || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">
                {user.name || user.username}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="nav-item logout-button mt-3"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="desktop-header hidden lg:flex">
          <div>
            <h1 className="text-xl font-semibold">
              {page === "dashboard"
                ? "Dashboard"
                : page === "wardrobe"
                ? "My Wardrobe"
                : "Upload Clothes"}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Welcome back, {user.name || user.username}!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="profile-avatar">
              {(user.name || user.username || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </header>

        <div className="page-container">
          {page === "dashboard" && (
            <Dashboard
              user={user}
              navigate={navigate}
            />
          )}

          {page === "upload" && (
            <UploadClothes
              onUploaded={() => navigate("wardrobe")}
            />
          )}

          {page === "wardrobe" && (
            <Wardrobe />
          )}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ user, navigate }) {
  return (
    <div className="space-y-7">
      <section className="hero-section">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-2 text-sm mb-5">
            <Sparkles size={16} />
            Your style, organized
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Dress better.
            <br />
            Feel confident.
            <br />
            Every day.
          </h2>

          <p className="text-gray-300 mt-4 max-w-md text-sm sm:text-base">
            Welcome, {user.name || user.username}.
            Keep your clothes organized and discover
            new ways to style your wardrobe.
          </p>

          <button
            onClick={() => navigate("upload")}
            className="hero-button mt-7"
          >
            Add New Clothes
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="hero-decoration">
          <Shirt size={150} strokeWidth={0.8} />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-title">Quick Actions</h2>
            <p className="section-subtitle">
              Manage your wardrobe
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("upload")}
            className="action-card text-left"
          >
            <div className="action-icon purple">
              <Upload size={24} />
            </div>

            <h3 className="font-semibold text-lg mt-4">
              Upload Clothes
            </h3>

            <p className="text-gray-400 text-sm mt-2">
              Add new clothing items to your collection.
            </p>

            <div className="text-purple-400 mt-4 flex items-center gap-2 text-sm">
              Upload now <ArrowRight size={16} />
            </div>
          </button>

          <button
            onClick={() => navigate("wardrobe")}
            className="action-card text-left"
          >
            <div className="action-icon pink">
              <Heart size={24} />
            </div>

            <h3 className="font-semibold text-lg mt-4">
              My Wardrobe
            </h3>

            <p className="text-gray-400 text-sm mt-2">
              View and organize all your clothing items.
            </p>

            <div className="text-pink-400 mt-4 flex items-center gap-2 text-sm">
              View wardrobe <ArrowRight size={16} />
            </div>
          </button>
        </div>
      </section>

      <section className="tip-card">
        <div className="flex items-start gap-4">
          <div className="action-icon purple shrink-0">
            <Sparkles size={23} />
          </div>

          <div>
            <h3 className="font-semibold">
              Style Tip
            </h3>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">
              Organize your clothes by category, color
              and occasion to make choosing your daily
              outfit easier.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
