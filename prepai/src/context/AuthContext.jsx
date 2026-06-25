import { createContext, useContext, useState, useEffect } from "react";
import API, { AUTH_UNAUTHORIZED_EVENT, clearAuthStorage } from "../api";

const AuthContext = createContext();

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    id: user.id || user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin === true,
    totalSessions: user.totalSessions,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const handleUnauthorized = () => {
      if (mounted) setUser(null);
    };

    const restoreSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        clearAuthStorage();
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await API.get("/auth/me");
        const authenticatedUser = normalizeUser(res.data?.user);

        if (!authenticatedUser) {
          throw new Error("Authenticated user payload is missing.");
        }

        localStorage.setItem("user", JSON.stringify(authenticatedUser));
        if (mounted) setUser(authenticatedUser);
      } catch (error) {
        if (error.response?.status === 401) {
          clearAuthStorage();
          if (mounted) setUser(null);
        } else {
          const stored = localStorage.getItem("user");
          if (stored && stored !== "undefined" && stored !== "null") {
            try {
              if (mounted) setUser(JSON.parse(stored));
            } catch {
              clearAuthStorage();
              if (mounted) setUser(null);
            }
          } else if (mounted) {
            setUser(null);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    restoreSession();

    return () => {
      mounted = false;
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    const authenticatedUser = normalizeUser(res.data.user);
    localStorage.setItem("user", JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await API.post("/auth/register", { name, email, password });
    localStorage.setItem("token", res.data.token);
    const authenticatedUser = normalizeUser(res.data.user);
    localStorage.setItem("user", JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    return res.data;
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
