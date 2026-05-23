import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { clearAuth, getUser } from "../lib/auth";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { LayoutDashboard, Briefcase, LogOut, Puzzle, BarChart3, Inbox, Menu, X, Bell, Mail, ChevronDown } from "lucide-react";

import { Button } from "./ui/button";
import { cn } from "../lib/cn";
import ProfileNotesPopover from "./ProfileNotesPopover";

export default function Navbar({ onLogout, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storedUser = getUser();
  const [user, setUser] = useState(storedUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getUser());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearAuth();
    queryClient.clear();
    toast.success("Logged out successfully");
    if (onLogout) onLogout();
    window.history.replaceState(null, "", "/");
    navigate("/", { replace: true });
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

      {/* ── Top Horizontal Navbar (Desktop) / Slide-over (Mobile) ── */}
      <nav
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[272px] bg-black transition-transform duration-300 ease-in-out lg:static lg:w-auto lg:mx-6 lg:mt-6 lg:mb-2 lg:h-[80px] lg:flex lg:items-center lg:justify-between lg:px-8 lg:translate-x-0 lg:rounded-[32px] shadow-[4px_4px_0px_0px_#1c1c1c]",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile Header Inside Sidebar */}
        <div className="flex items-center justify-between p-6 lg:hidden">
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

        {/* Desktop Logo */}
        <Link
          to="/dashboard"
          className="hidden lg:flex items-center px-4 text-[24px] font-extrabold tracking-tight text-white hover:text-white/80 transition-colors"
        >
          HustleMap
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-col gap-2 px-6 lg:flex-row lg:items-center lg:gap-2 lg:px-0 lg:mx-auto">
          <Link
            to="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] transition-all duration-200 font-bold",
              isActive("/dashboard")
                ? "bg-white text-black shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            Dashboard
          </Link>
          <Link
            to="/jobs"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] transition-all duration-200 font-bold",
              isActive("/jobs")
                ? "bg-white text-black shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            My Applications
          </Link>
          <Link
            to="/analytics"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] transition-all duration-200 font-bold",
              isActive("/analytics")
                ? "bg-white text-black shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            Analytics
          </Link>
          <Link
            to="/captured"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] transition-all duration-200 font-bold",
              isActive("/captured")
                ? "bg-white text-black shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            Captured Jobs
          </Link>
          <Link
            to="/extension"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] transition-all duration-200 font-bold",
              isActive("/extension")
                ? "bg-white text-black shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            Extension
          </Link>
        </div>

        {/* Right side icons & Profile (Desktop only, mobile will have it in TopHeader or below nav) */}
        {user && (
          <div className="hidden lg:flex items-center gap-5">
            {/* Action Icons */}
            <div className="flex items-center gap-4 text-white/50">
              <ProfileNotesPopover theme="dark" />
              <a 
                href="https://mail.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center hover:text-white transition-colors"
                title="Open Gmail"
              >
                <Mail className="h-5 w-5" />
              </a>
              <button className="flex items-center justify-center hover:text-white transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full border-2 border-black"></span>
              </button>
            </div>
            
            <div className="h-8 w-[1px] bg-white/20"></div>
            
            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-black font-extrabold text-sm shrink-0 transition-transform group-hover:scale-105">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-bold text-white">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
                </div>
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-48 bg-white border-2 border-charcoal rounded-[20px] shadow-[4px_4px_0px_0px_#1c1c1c] py-1 z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 border-b-2 border-charcoal/10">
                    <p className="text-sm font-extrabold text-charcoal truncate tracking-tight">{user?.name}</p>
                    <p className="text-xs font-bold text-charcoal/60 truncate">{user?.email}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-charcoal hover:bg-sage transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-charcoal" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Action Icons */}
        <div className="flex items-center justify-center gap-6 py-4 mt-auto border-t border-white/20 lg:hidden">
          <ProfileNotesPopover theme="dark" />
          <a 
            href="https://mail.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center hover:text-white/80 transition-colors text-white"
            title="Open Gmail"
          >
            <Mail className="h-5 w-5" />
          </a>
          <button className="flex items-center justify-center hover:text-white/80 transition-colors text-white relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full border-2 border-black"></span>
          </button>
        </div>

        {/* Mobile Logout (shows at bottom of sidebar) */}
        <div className="p-6 lg:hidden">
           <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold bg-white text-black rounded-full"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
        </div>
      </nav>
    </>
  );
}
