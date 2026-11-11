
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import axios from "axios";

// =====================================
// API CONFIGURATION
// =====================================

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================
// AUTH CONTEXT
// =====================================

const AuthContext = createContext(null);

// =====================================
// AUTH PROVIDER
// =====================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  // =====================================
  // RESTORE LOGIN SESSION
  // =====================================

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);

      } catch (error) {
        console.error(
          "Session restoration failed:",
          error.response?.data || error.message
        );

        localStorage.removeItem("token");
        setUser(null);

      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // =====================================
  // LOGIN
  // =====================================

  const login = async ({ email, password }) => {
    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const { token, user } = response.data;

      if (!token) {
        throw new Error("Login response did not contain a token.");
      }

      // Save JWT token
      localStorage.setItem("token", token);

      // Save logged-in user
      setUser(user);

      return {
        success: true,
        user,
        token,
      };

    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data || error.message
      );

      throw new Error(
        error.response?.data?.message || "Unable to login."
      );
    }
  };

  // =====================================
  // REGISTER
  // =====================================

  const register = async ({
    name,
    email,
    username,
    password,
  }) => {
    try {
      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        username: username.trim(),
        password,
      });

      const { token, user } = response.data;

      if (!token) {
        throw new Error(
          "Registration response did not contain a token."
        );
      }

      // Save JWT token
      localStorage.setItem("token", token);

      // Save registered user
      setUser(user);

      return {
        success: true,
        user,
        token,
      };

    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data || error.message
      );

      throw new Error(
        error.response?.data?.message || "Unable to register."
      );
    }
  };

  // =====================================
  // LOGOUT
  // =====================================

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // =====================================
  // AUTHENTICATED API REQUEST
  // =====================================

  const authAxios = async (config) => {
    const token = localStorage.getItem("token");

    return api({
      ...config,
      headers: {
        ...config.headers,
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  };

  // =====================================
  // CONTEXT VALUES
  // =====================================

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    authAxios,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// =====================================
// CUSTOM AUTH HOOK
// =====================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
};
