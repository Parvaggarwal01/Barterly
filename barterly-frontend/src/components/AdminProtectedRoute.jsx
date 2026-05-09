import { Navigate } from "react-router-dom";
import authService from "../services/authService";

const AdminProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  console.log("AdminProtectedRoute - isAuthenticated:", isAuthenticated);
  console.log("AdminProtectedRoute - user:", user);
  console.log("AdminProtectedRoute - user role:", user?.role);
  console.log("AdminProtectedRoute - is admin?:", user?.role === "admin");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    // Redirect non-admin users to user dashboard
    console.log("Not admin, redirecting to user dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("Admin verified, rendering admin dashboard");
  return children;
};

export default AdminProtectedRoute;
