import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import * as authService from "../services/authService";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.log(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);
  const login = async (credentials) => {
    await authService.login(credentials);
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        isSubscribed: user?.is_subscribed ?? false,
        isAdmin: user?.is_staff ?? false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
