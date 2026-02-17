import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { clearAuth, getUser } from "../lib/auth";
import toast from "react-hot-toast";

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const user = getUser();

  const handleLogout = () => {
    // Clear authentication data
    clearAuth();

    // Clear all React Query cache to reset user-specific state
    queryClient.clear();

    // Show success message
    toast.success("Logged out successfully");

    // Notify parent component of logout
    if (onLogout) {
      onLogout();
    }

    // Prevent back navigation by replacing history state
    window.history.replaceState(null, "", "/");

    // Redirect to Landing Page with replace to prevent back button navigation
    navigate("/", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link to="/dashboard" className="subtitle text-black">
            HustleMap
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/jobs"
              className={`body-text ${
                isActive("/jobs")
                  ? "text-black font-semibold border-b-2 border-black pb-1"
                  : "text-black hover:underline"
              }`}
            >
              My Applications
            </Link>
            {user && (
              <>
                <span className="body-text text-black">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="body-text text-black hover:underline"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
