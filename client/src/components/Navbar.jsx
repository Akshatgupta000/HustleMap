import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { clearAuth, getUser, setAuth } from "../lib/auth";
import { authAPI } from "../lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LayoutDashboard, Briefcase, LogOut, Copy, Sparkles, Menu, X, Puzzle, Plus, BarChart3, Inbox } from "lucide-react";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "../lib/cn";

export default function Navbar({ onLogout, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storedUser = getUser();
  const [user, setUser] = useState(storedUser);


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
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-black px-4 lg:hidden">
        <Link
          to="/dashboard"
          className="flex items-center text-[18px] font-extrabold tracking-tight text-white"
        >
          HustleMap
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="h-9 w-9 p-0 text-white hover:bg-white/10 hover:text-white"
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
          "fixed inset-y-0 left-0 z-50 w-[272px] bg-black transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col p-6">
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center rounded-full px-2 py-1.5 text-[22px] font-extrabold tracking-tight text-white hover:bg-white/10 transition-all duration-200"
            >
              HustleMap
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="mb-8">
            <Link
              to="/jobs/new"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-[24px] bg-black border border-white p-4 hover:bg-white/10 transition-colors shadow-sm group"
            >
              <div className="text-[14px] font-bold leading-tight text-white ml-2">
                Add<br />new Job
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:scale-105">
                <Plus className="h-6 w-6" />
              </div>
            </Link>
          </div>

          <nav className="space-y-1">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-full px-5 py-3 text-[14px] transition-all duration-200 font-bold",
                isActive("/dashboard")
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/jobs"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-full px-5 py-3 text-[14px] transition-all duration-200 font-bold",
                isActive("/jobs")
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <Briefcase className="h-4 w-4" />
              My Applications
            </Link>
            <Link
              to="/analytics"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-full px-5 py-3 text-[14px] transition-all duration-200 font-bold",
                isActive("/analytics")
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
            <Link
              to="/captured"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-full px-5 py-3 text-[14px] transition-all duration-200 font-bold",
                isActive("/captured")
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <Inbox className="h-4 w-4" />
              Captured Jobs
            </Link>
            <Link
              to="/extension"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-full px-5 py-3 text-[14px] transition-all duration-200 font-bold",
                isActive("/extension")
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <Puzzle className="h-4 w-4" />
              Extension
            </Link>
          </nav>

          {user && (
            <div className="mt-auto pt-4">
              <div className="rounded-[24px] border border-white/20 bg-transparent p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-white font-bold tracking-wide">EXTENSION ID</span>
                    {user.extensionId ? (
                      <Badge className="font-mono text-[10px] bg-white/10 text-white rounded-full border-none" variant="muted">
                        {user.extensionId}
                      </Badge>
                    ) : (
                      <Button
                        onClick={ensureExtensionId}
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] px-3 rounded-full border-white/20 text-white hover:bg-white hover:text-black transition-colors"
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
                      className="w-full justify-between h-9 text-[12px] rounded-full bg-white/10 text-white hover:bg-white/20 border-none transition-colors"
                      title="Copy Extension ID"
                    >
                      Copy ID
                      <Copy className="h-4 w-4 text-white/70" />
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
