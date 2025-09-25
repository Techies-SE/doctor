import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const isAuthenticated = Boolean(localStorage.getItem("authToken"));
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}