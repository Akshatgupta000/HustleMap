import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { clearAuth, getUser } from "../lib/auth";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { LayoutDashboard, Briefcase, LogOut, Puzzle, BarChart3, Inbox, Menu, X, Bell, Mail, ChevronDown, Flame, Pencil, Check } from "lucide-react";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "../lib/cn";
import ProfileNotesPopover from "./ProfileNotesPopover";
import { authAPI, jobsAPI } from "../lib/api";
import { setAuth } from "../lib/auth";
import { Copy } from "lucide-react";

export default function Navbar({ onLogout, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const storedUser = getUser();
  const [user, setUser] = useState(storedUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      setEditedName(user.name);
    }
  }, [user]);

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getUser());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const { data: feedData } = useQuery({
    queryKey: ["dashboardFeed"],
    queryFn: () => jobsAPI.getDashboardFeed().then((res) => res.data),
    enabled: !!user,
  });
  
  const streak = feedData?.streak || 0;

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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsEditingName(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", editedName.trim());
      const response = await authAPI.updateUserProfile(formData);
      
      const updatedUser = { ...user, name: response.data.name };
      setUser(updatedUser);
      setAuth(localStorage.getItem("token"), updatedUser);
      
      window.dispatchEvent(new Event("storage"));
      toast.success("Name updated successfully!");
      setIsEditingName(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update name");
      console.error("Save name error:", error);
    }
  };

  const handleLogout = () => {
    clearAuth();
    queryClient.clear();
    
    if (onLogout) onLogout();
    window.history.replaceState(null, "", "/");
    navigate("/", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ── Mobile Header ── */}
      <header className="sticky top-0 z-40 flex h-13 items-center justify-between bg-black px-4 lg:hidden">
        <Link
          to="/dashboard"
          className="flex items-center text-[17px] font-extrabold tracking-tight text-white"
        >
          HustleMap
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
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
          "fixed inset-y-0 left-0 z-50 w-[272px] bg-black transition-transform duration-300 ease-in-out lg:static lg:w-auto lg:mx-5 lg:mt-5 lg:mb-0 lg:h-[58px] lg:flex lg:items-center lg:justify-between lg:px-5 lg:translate-x-0 lg:rounded-[20px] shadow-[2px_2px_0px_0px_#2a2a2a]",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile Header Inside Sidebar */}
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Link
            to="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center rounded-full px-2 py-1.5 text-[21px] font-extrabold tracking-tight text-white hover:bg-white/10 transition-all duration-200"
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
          className="hidden lg:flex items-center px-1 text-[18px] font-extrabold tracking-tight text-white hover:text-white/80 transition-colors"
        >
          HustleMap
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-col gap-2 px-6 lg:flex-row lg:items-center lg:gap-0.5 lg:px-0 lg:mx-auto">
          <Link
            to="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] transition-all duration-200 font-bold",
              isActive("/dashboard")
                ? "bg-white text-black"
                : "text-white/65 hover:bg-white/10 hover:text-white",
            )}
          >
            Dashboard
          </Link>
          <Link
            to="/jobs"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] transition-all duration-200 font-bold",
              isActive("/jobs")
                ? "bg-white text-black"
                : "text-white/65 hover:bg-white/10 hover:text-white",
            )}
          >
            Applications
          </Link>
          <Link
            to="/analytics"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] transition-all duration-200 font-bold",
              isActive("/analytics")
                ? "bg-white text-black"
                : "text-white/65 hover:bg-white/10 hover:text-white",
            )}
          >
            Analytics
          </Link>
          <Link
            to="/captured"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] transition-all duration-200 font-bold",
              isActive("/captured")
                ? "bg-white text-black"
                : "text-white/65 hover:bg-white/10 hover:text-white",
            )}
          >
            Captured
          </Link>
          <Link
            to="/extension"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] transition-all duration-200 font-bold",
              isActive("/extension")
                ? "bg-white text-black"
                : "text-white/65 hover:bg-white/10 hover:text-white",
            )}
          >
            Extension
          </Link>
        </div>

        {/* Right side icons & Profile (Desktop only) */}
        {user && (
          <div className="hidden lg:flex items-center gap-4">
            {/* Action Icons */}
            <div className="flex items-center gap-3.5 text-white/50">
              <ProfileNotesPopover theme="dark" />
              <a 
                href="https://mail.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center hover:text-white transition-colors"
                title="Open Gmail"
              >
                <Mail className="h-4.5 w-4.5" />
              </a>

            </div>
            
            <div className="h-7 w-[1px] bg-white/15"></div>
            
            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setIsEditingName(false);
                }}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                {streak > 0 && (
                  <div 
                    className="flex items-center gap-0.5 text-[11px] font-black text-[#FF9500] bg-[#FF9500]/10 border border-[#FF9500]/20 px-1.5 py-0.5 rounded-full mr-1"
                    title={`${streak} day application streak!`}
                  >
                    <Flame size={12} className="fill-[#FF9500]/30" />
                    {streak}
                  </div>
                )}
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-extrabold text-[13px] shrink-0 transition-transform group-hover:scale-105">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-bold text-white">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-white/50 group-hover:text-white transition-colors" />
                </div>
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-52 bg-white border-2 border-charcoal rounded-[20px] shadow-[4px_4px_0px_0px_#1c1c1c] py-1 z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-charcoal/10">
                    {isEditingName ? (
                      <div className="flex items-center gap-1.5 py-0.5 mb-1">
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="w-full px-2 py-0.5 text-[13px] font-bold border-2 border-charcoal rounded-[8px] focus:outline-none focus:ring-1 focus:ring-sage text-charcoal bg-white"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveName();
                            if (e.key === "Escape") {
                              setIsEditingName(false);
                              setEditedName(user?.name || "");
                            }
                          }}
                        />
                        <button 
                          onClick={handleSaveName}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Save"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            setIsEditingName(false);
                            setEditedName(user?.name || "");
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-1 group/name mb-1">
                        <p className="text-[14px] font-extrabold text-charcoal truncate tracking-tight flex-1">{user?.name}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingName(true);
                            setEditedName(user?.name || "");
                          }}
                          className="p-1 text-charcoal/40 hover:text-charcoal hover:bg-charcoal/5 rounded transition-all"
                          title="Edit name"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    <p className="text-[11px] font-bold text-charcoal/55 truncate">{user?.email}</p>
                  </div>

                  <div className="p-1.5">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-3 py-2 text-[12.5px] font-bold text-charcoal rounded-[12px] hover:bg-red-50 hover:text-red-600 transition-colors group/logout"
                    >
                      Logout
                      <LogOut className="h-3.5 w-3.5 text-charcoal/40 group-hover/logout:text-red-600 transition-colors" />
                    </button>
                  </div>
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

        </div>

        {/* Mobile Logout (shows at bottom of sidebar) */}
        <div className="p-6 lg:hidden">
           <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold bg-white text-black rounded-full"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
        </div>
      </nav>
    </>
  );
}
