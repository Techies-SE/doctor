// RedirectIfAuth.jsx
import { Navigate } from "react-router-dom";

export default function RedirectIfAuth({ children, isAuthenticated }) {
  if (isAuthenticated) {
    const role = localStorage.getItem("userRole");
    return <Navigate to={role === "doctor" ? "/dashboard" : "/admindashboard"} replace />;
  }
  return children;
}
