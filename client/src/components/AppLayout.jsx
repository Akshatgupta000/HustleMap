import { useState } from "react";
import Navbar from "./Navbar";
import TopHeader from "./TopHeader";

export default function AppLayout({ onLogout, children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen bg-sage text-charcoal flex flex-col overflow-hidden">
      <Navbar 
        onLogout={onLogout} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      <main className="min-w-0 flex-1 bg-sage flex flex-col overflow-y-auto relative">
        <TopHeader onLogout={onLogout} />
        <div className="w-full max-w-[1600px] mx-auto px-4 py-8 sm:px-8 lg:px-12 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

