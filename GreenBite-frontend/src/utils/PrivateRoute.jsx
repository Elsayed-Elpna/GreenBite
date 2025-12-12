import { Outlet, Navigate } from "react-router-dom";
const PrivateRoute = () => {
  const isAuthenticated = Boolean(localStorage.getItem("access_token"));
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
export default PrivateRoute;
