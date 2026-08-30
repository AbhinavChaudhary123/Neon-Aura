import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const C = createContext();

export const useAuth = () => useContext(C);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const r = await api.get("/auth/me");
      setUser(r.data.user);
      return r.data.user;
    } catch (error) {
      console.error("Failed to refresh user:", error);
      return null;
    }
  };

  useEffect(() => {
    if (localStorage.getItem("na_token")) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const r = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem("na_token", r.data.token);
    setUser(r.data.user);

    return r.data;
  };

  const register = async (name, email, password) => {
    const r = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    localStorage.setItem("na_token", r.data.token);
    setUser(r.data.user);

    return r.data;
  };

  const logout = () => {
    localStorage.removeItem("na_token");
    setUser(null);
  };

  return (
    <C.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </C.Provider>
  );
}