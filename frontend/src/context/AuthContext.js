import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "hisaab_token";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [checking, setChecking] = useState(true); // verifying stored token on mount

  // Verify stored token once on app load
  useEffect(() => {
    if (!token) { setChecking(false); return; }
    axios
      .post(`${API_BASE}/auth/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        if (!data.valid) logout();
      })
      .catch(() => logout())
      .finally(() => setChecking(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (password) => {
    const { data } = await axios.post(`${API_BASE}/auth/login`, { password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    toast("Logged out");
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuth: !!token, checking }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
