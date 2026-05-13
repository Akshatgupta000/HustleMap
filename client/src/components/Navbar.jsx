import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { clearAuth, getUser, setAuth } from "../lib/auth";
import { authAPI } from "../lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LayoutDashboard, Briefcase, LogOut, Copy, Sparkles, Menu, X, Puzzle, Plus } from "lucide-react";

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
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Link
          to="/dashboard"
          className="flex items-center text-[18px] font-bold tracking-tight text-slate-900"
        >
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
          "fixed inset-y-0 left-0 z-50 w-[272px] border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col p-4">
          <div className="mb-4 flex items-center justify-between">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center rounded-xl px-2 py-1.5 text-[18px] font-bold tracking-tight text-slate-900 hover:bg-slate-100 transition-all duration-200"
            >
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

          <div className="mb-6">
            <Link
              to="/jobs/new"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-2xl bg-white p-3 hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm group"
            >
              <div className="text-[13px] font-bold leading-tight text-slate-700 group-hover:text-slate-900 ml-1">
                Add<br />new Job
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition-transform group-hover:scale-105">
                <Plus className="h-5 w-5" />
              </div>
            </Link>
          </div>

          <nav className="space-y-1">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-[14px] transition-all duration-200",
                isActive("/dashboard")
                  ? "bg-slate-100 text-slate-900 font-semibold shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium",
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/jobs"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-[14px] transition-all duration-200",
                isActive("/jobs")
                  ? "bg-slate-100 text-slate-900 font-semibold shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium",
              )}
            >
              <Briefcase className="h-4 w-4" />
              My Applications
            </Link>
            <Link
              to="/extension"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-[14px] transition-all duration-200",
                isActive("/extension")
                  ? "bg-slate-100 text-slate-900 font-semibold shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium",
              )}
            >
              <Puzzle className="h-4 w-4" />
              Extension
            </Link>
          </nav>

          {user && (
            <div className="mt-auto pt-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 shadow-sm p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-slate-500 font-semibold tracking-wide">EXTENSION ID</span>
                    {user.extensionId ? (
                      <Badge className="font-mono text-[10px]" variant="muted">
                        {user.extensionId}
                      </Badge>
                    ) : (
                      <Button
                        onClick={ensureExtensionId}
                        variant="outline"
                        size="sm"
                        className="h-6 text-[11px] px-2"
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
                      className="w-full justify-between h-8 text-[12px]"
                      title="Copy Extension ID"
                    >
                      Copy ID
                      <Copy className="h-3.5 w-3.5 text-slate-500" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
