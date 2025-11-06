import { useEffect, useState, createContext } from "react";
import { jwtDecode } from "jwt-decode";
import api, { postMultipart, putMultipart } from "../services/api";
import { useContext } from "react";
import { useToast } from "./ToastContext";
import { useLanguage } from "./LanguageContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // const decoded = jwtDecode(token);
        // const isExpired = decoded.exp * 1000 < Date.now();

        // if (isExpired) {
        //   localStorage.removeItem("token");
        //   setLoading(false);
        //   return;
        // }

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const { data } = await api.get("/auth/me", { signal });
        setUser(data.data);
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.error(
            "Session check failed, logging out:",
            error.response?.data?.error
          );
          localStorage.removeItem("token");
          delete api.defaults.headers.common["Authorization"];
          setUser(null);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };
    checkUserLoggedIn();
    return () => {
      controller.abort();
    };
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      const { data } = await postMultipart("/auth/register", userData);
      localStorage.setItem("token", data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      setUser(data.data);
      showToast("Registration successful", "success");
      return true;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed";
      showToast(message, "error");

      return false;
    }
  };

  // Login user
  const login = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", userData);
      const { token, data } = response.data;

      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(data);
      showToast(t("लगइन सफल भयो", "Login successful"), "success");
      return data;
    } catch (error) {
      console.error("Login Error: ", error);
      const message = error.response?.data?.error || "Something went wrong";
      showToast(message, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await api.get("/auth/logout");
      setUser(null);
      showToast(t("लगआउट सफल भयो", "Logout successful"), "success");
    } catch (error) {
      console.error("Logout failed:", error);
      showToast(t("लगआउट असफल भयो", "Logout failed"), "error");
    }

    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await api.patch("/auth/updatedetails", userData);
      if (response.data.success) {
        setUser(response.data.data);
        showToast(
          t("प्रोफाइल सफलतापूर्वक अपडेट भयो", "Profile updated successfully"),
          "success"
        );
        return true;
      } else {
        showToast(response.data.message || "Update failed", "error");
        return false;
      }
    } catch (error) {
      const message = error.response?.data?.error || "Something went wrong";
      showToast(message, "error");
      return false;
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      const { data } = await api.patch("/auth/updatepassword", passwordData);
      localStorage.setItem("token", data.token);
      showToast("Password updated successfully", "success");
      return true;
    } catch (error) {
      const message = error.response?.data?.error || "Something went wrong";
      showToast(message, "error");
      return false;
    }
  };

  //Update avatar
  const updateAvatar = async (avatarFile) => {
    if (!avatarFile) {
      showToast("Please select an image to upload.", "error");
      return false;
    }

    const formData = new FormData();
    formData.append("avatar", avatarFile);
    try {
      const response = await api.patch("/auth/updateavatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.success) {
        setUser(response.data.data);
        return true;
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update avatar.";
      showToast(message, "error");
      return false;
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateProfile,
        updatePassword,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
