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
      <div className="absolute left-4 sm:left-5 text-charcoal/50 group-focus-within:text-charcoal transition-colors duration-200">
        <Plus size={20} strokeWidth={2.5} />
      </div>
      
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Quick add a company name or job URL..."
        className="w-full h-12 sm:h-13 pl-11 sm:pl-12 pr-14 sm:pr-26 rounded-full border border-charcoal/25 bg-white text-[14.5px] font-semibold text-charcoal outline-none transition-all duration-200 placeholder:text-charcoal/35 focus:ring-2 focus:ring-charcoal/15 focus:border-charcoal"
      />
      
      <div className="absolute right-2 flex items-center gap-1.5">
        <button 
          onClick={handleSubmit}
          className="hidden sm:flex items-center gap-1 px-3.5 py-1.5 bg-charcoal text-white hover:bg-charcoal/90 rounded-full text-[11.5px] font-bold transition-colors duration-200"
        >
          <span>Enter</span>
          <span className="text-[13px] leading-none mb-0.5">↵</span>
        </button>
        <button
          onClick={handleSubmit}
          className="sm:hidden flex items-center justify-center w-9 h-9 bg-charcoal text-white hover:bg-charcoal/90 rounded-full transition-colors"
        >
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
