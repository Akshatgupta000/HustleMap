import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { clearAuth, getUser, setAuth } from "../lib/auth";
import { authAPI } from "../lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LayoutDashboard, Briefcase, LogOut, Copy, Sparkles, Menu, X } from "lucide-react";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "../lib/cn";

export default function Navbar({ onLogout, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storedUser = getUser();
  const [user, setUser] = useState(storedUser);

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

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getUser());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const ensureExtensionId = async () => {
    if (!user) return;
    if (user.extensionId) return;

    try {
      const response = await authAPI.getExtensionId();
      const extensionId = response.data?.extensionId;
      if (extensionId) {
        const updatedUser = { ...user, extensionId };
        setUser(updatedUser);
        setAuth(localStorage.getItem("token"), updatedUser);
        toast.success("Extension ID generated");
      }
    } catch (error) {
      toast.error("Failed to generate Extension ID");
      console.error("GetExtensionId error:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ── Mobile Header ── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-notion-border bg-notion-bg px-4 lg:hidden">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-notion-text"
        >
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-white shadow-soft border border-notion-border">
            <Sparkles className="h-4 w-4 text-notion-accent" />
          </span>
          HustleMap
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="h-9 w-9 p-0"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* ── Mobile Overlay ── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[272px] border-r border-notion-border bg-notion-bg transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col p-4">
          <div className="mb-4 flex items-center justify-between">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-semibold tracking-tight text-notion-text hover:bg-black/5 transition-all duration-200"
            >
              <span className="grid h-7 w-7 place-items-center rounded-xl bg-white shadow-soft border border-notion-border">
                <Sparkles className="h-4 w-4 text-notion-accent" />
              </span>
              HustleMap
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="space-y-1">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                isActive("/dashboard")
                  ? "bg-white border border-notion-border shadow-soft text-notion-text"
                  : "text-notion-text/90 hover:bg-black/5",
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/jobs"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                isActive("/jobs")
                  ? "bg-white border border-notion-border shadow-soft text-notion-text"
                  : "text-notion-text/90 hover:bg-black/5",
              )}
            >
              <Briefcase className="h-4 w-4" />
              My Applications
            </Link>
          </nav>

          {user && (
            <div className="mt-4 rounded-xl border border-notion-border bg-white shadow-soft p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-notion-text truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-notion-muted truncate">
                    Signed in
                  </p>
                </div>
                <LayoutDashboard className="h-4 w-4 text-notion-muted" />
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-notion-muted">Extension ID</span>
                  {user.extensionId ? (
                    <Badge className="font-mono" variant="muted">
                      {user.extensionId}
                    </Badge>
                  ) : (
                    <Button
                      onClick={ensureExtensionId}
                      variant="outline"
                      size="sm"
                      className="h-8"
                    >
                      Generate
                    </Button>
                  )}
                </div>

                {user.extensionId && (
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(user.extensionId);
                      toast.success("Extension ID copied to clipboard");
                    }}
                    variant="secondary"
                    size="sm"
                    className="w-full justify-between"
                    title="Copy Extension ID"
                  >
                    Copy ID
                    <Copy className="h-4 w-4 text-notion-muted" />
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="mt-auto pt-4">
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="w-full justify-between"
            >
              Logout
              <LogOut className="h-4 w-4 text-notion-muted" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
