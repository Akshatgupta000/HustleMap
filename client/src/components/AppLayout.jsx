import { useState } from "react";
import Navbar from "./Navbar";

export default function AppLayout({ onLogout, children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-notion-bg text-notion-text">
      <div className="flex flex-col lg:flex-row">
        <Navbar 
          onLogout={onLogout} 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
        />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

