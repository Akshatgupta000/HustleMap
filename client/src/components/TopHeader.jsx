import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { clearAuth, getUser } from "../lib/auth";
import toast from "react-hot-toast";
import { Bell, Mail, ChevronDown, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function TopHeader({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = getUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const getPageTitle = () => {
    if (location.pathname.includes('/jobs')) return 'My Applications';
    if (location.pathname.includes('/extension')) return 'Browser Extension';
    if (location.pathname.includes('/analytics')) return 'Analytics';
    if (location.pathname.includes('/captured')) return 'Captured Jobs';
    return 'Dashboard';
  };

  const dateOptions = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
  const formattedDate = new Date().toLocaleDateString('en-US', dateOptions);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-5 lg:px-12 bg-transparent">
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-extrabold text-charcoal tracking-tight leading-none mb-1.5">
          {getPageTitle()}
        </h1>
        <p className="text-[12px] sm:text-[13px] font-bold text-charcoal/50">
          {formattedDate}
        </p>
      </div>
      
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4 text-charcoal/50">
          <button className="hover:text-charcoal transition-colors">
            <Mail className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
          </button>
          <button className="hover:text-charcoal transition-colors relative">
            <Bell className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-charcoal rounded-full border-2 border-sage"></span>
          </button>
        </div>
        
        <div className="h-6 sm:h-8 w-[1px] bg-charcoal/20"></div>
        
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-charcoal flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0 transition-colors group-hover:bg-charcoal/80">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[14px] font-bold text-charcoal">
                {user?.name}
              </span>
              <ChevronDown className="h-4 w-4 text-charcoal/50 group-hover:text-charcoal transition-colors" />
            </div>
          </div>
          
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-charcoal rounded-[20px] shadow-sm py-1 z-50 overflow-hidden">
              <div className="px-4 py-2 border-b border-charcoal/10 sm:hidden">
                <p className="text-sm font-bold text-charcoal truncate">{user?.name}</p>
                <p className="text-xs text-charcoal/60 truncate">{user?.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal/70 hover:bg-sage hover:text-charcoal transition-colors"
              >
                <LogOut className="h-4 w-4 text-charcoal/50" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
