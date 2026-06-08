import { createContext, useContext, useEffect, useState } from "react";
import { http } from "../api/http";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("hd-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("hd-token"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("hd-token", token);
    } else {
      localStorage.removeItem("hd-token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("hd-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("hd-user");
    }
  }, [user]);

  const login = async (email, password) => {
    const response = await http.post("/auth/login", { email, password });
    setToken(response.data.token);
    setUser(response.data.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

