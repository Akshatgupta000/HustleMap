import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";

export default function QuickAddBar() {
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    
    const val = inputValue.trim();
    
    // Basic URL detection
    const isUrl = val.startsWith("http://") || val.startsWith("https://") || val.includes(".com") || val.includes(".org") || val.includes(".io");
    
    if (isUrl) {
      // Prepend https if missing for domains like google.com
      const finalUrl = !val.startsWith("http") ? `https://${val}` : val;
      navigate("/jobs/new", { state: { prefill: { job_url: finalUrl } } });
    } else {
      navigate("/jobs/new", { state: { prefill: { company: val } } });
    }
    
    setInputValue("");
  };

  return (
    <div className="relative flex items-center w-full group">
      <div className="absolute left-4 sm:left-6 text-charcoal/60 group-focus-within:text-charcoal transition-colors duration-200">
        <Plus size={22} strokeWidth={2.5} />
      </div>
      
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Quick add a company name or job URL..."
        className="w-full h-14 sm:h-16 pl-12 sm:pl-14 pr-16 sm:pr-28 rounded-full border border-charcoal bg-white text-[15.5px] font-semibold text-charcoal outline-none transition-all duration-200 placeholder:text-charcoal/40 focus:ring-2 focus:ring-charcoal/20"
      />
      
      <div className="absolute right-2 sm:right-3 flex items-center gap-2">
        <button 
          onClick={handleSubmit}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-charcoal text-white hover:bg-charcoal/90 rounded-full text-[12px] font-bold transition-colors duration-200"
        >
          <span>Enter</span>
          <span className="text-[14px] leading-none mb-0.5">↵</span>
        </button>
        <button
          onClick={handleSubmit}
          className="sm:hidden flex items-center justify-center w-10 h-10 bg-charcoal text-white hover:bg-charcoal/90 rounded-full transition-colors"
        >
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
