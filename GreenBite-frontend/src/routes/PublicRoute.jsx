import React from "react";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
const PublicRoute = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  if (loading) {
    return <p>Loading...</p>;
  }
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;
