import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

export default function AppLayout({ onLogout, children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    // Scroll to top of the main container when changing routes
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <div className="h-screen bg-sage text-charcoal flex flex-col overflow-hidden">
      <Navbar 
        onLogout={onLogout} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      <main ref={mainRef} className="min-w-0 flex-1 bg-sage flex flex-col overflow-y-auto relative scroll-smooth">
        <div className="w-full max-w-[1600px] mx-auto px-3 pb-0 pt-5 sm:px-6 lg:px-8 flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
}

