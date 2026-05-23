import { useLocation, Link } from "react-router-dom";
import { getUser } from "../lib/auth";
import toast from "react-hot-toast";
import { Plus, Copy } from "lucide-react";
import { authAPI } from "../lib/api";
import { useState, useEffect } from "react";
import { setAuth } from "../lib/auth";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default function TopHeader() {
  const location = useLocation();
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
    <header className="flex items-center justify-between px-6 py-3.5 lg:px-12 bg-transparent border-b border-charcoal/10">
      <div>
        <h1 className="text-[19px] sm:text-[21px] font-extrabold text-charcoal tracking-tight leading-none mb-1">
          {getPageTitle()}
        </h1>
        <p className="text-[11.5px] sm:text-[12.5px] font-semibold text-charcoal/45">
          {formattedDate}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:gap-4">
        {/* Extension ID Block */}
        {user && (
          <div className="flex items-center gap-2 bg-sage-light border border-charcoal/30 rounded-full px-3 py-1 shadow-sm">
            <span className="text-[10.5px] font-bold text-charcoal/70 tracking-wide hidden sm:inline">EXT ID</span>
            {user.extensionId ? (
              <div className="flex items-center gap-2">
                <Badge className="font-mono text-[10px] bg-charcoal text-white rounded-full" variant="secondary">
                  {user.extensionId}
                </Badge>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(user.extensionId);
                    toast.success("Extension ID copied to clipboard");
                  }}
                  className="text-charcoal/60 hover:text-charcoal transition-colors"
                  title="Copy ID"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                onClick={ensureExtensionId}
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2 rounded-full border-charcoal text-charcoal hover:bg-charcoal hover:text-white transition-colors"
              >
                Generate
              </Button>
            )}
          </div>
        )}

        {/* Add New Job Button */}
        <Link
          to="/jobs/new"
          className="flex items-center gap-2 rounded-full bg-charcoal text-white px-4 py-2 hover:bg-charcoal/90 transition-colors shadow-[2px_2px_0px_0px_#1c1c1c] active:translate-y-[2px] active:shadow-none"
        >
          <span className="text-[13px] font-bold hidden sm:inline">Add new Job</span>
          <span className="text-[13px] font-bold sm:hidden">Add</span>
          <Plus className="h-4 w-4" strokeWidth={3} />
        </Link>
      </div>
    </header>
  );
}
