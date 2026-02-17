import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";

export default function ProtectedRoute({ children, isAuth }) {
  // Use the isAuth prop if provided (for state-driven auth), otherwise fall back to isAuthenticated()
  const authenticated = isAuth !== undefined ? isAuth : isAuthenticated();

  if (!authenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}
