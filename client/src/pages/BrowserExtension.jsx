import { Chrome, Download, Settings, Monitor, Save, ExternalLink, ChevronRight, Puzzle, Copy } from "lucide-react";
import { Button } from "../components/ui/button";
import { getUser, setAuth } from "../lib/auth";
import { authAPI } from "../lib/api";
import { useState } from "react";
import toast from "react-hot-toast";

export default function BrowserExtension() {
  const [user, setUser] = useState(getUser());

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
  const steps = [
    {
      title: "Step 1 – Visit the extension repository",
      description: "Go to the official HustleMap extension repository on GitHub to access the source code.",
      icon: ExternalLink,
    },
    {
      title: "Step 2 – Download or clone the extension",
      description: "Clone the repository using Git or download the ZIP file and extract it to a folder on your computer.",
      icon: Download,
    },
    {
      title: "Step 3 – Open Chrome Extensions",
      description: "Open your Chrome browser and navigate to chrome://extensions by typing it in the address bar.",
      icon: Chrome,
    },
    {
      title: "Step 4 – Enable Developer Mode",
      description: "Locate the 'Developer mode' toggle in the top right corner of the Extensions page and turn it on.",
      icon: Settings,
    },
    {
      title: "Step 5 – Click 'Load Unpacked'",
      description: "Click the 'Load unpacked' button that appears after enabling Developer Mode.",
      icon: Monitor,
    },
    {
      title: "Step 6 – Select the extension folder",
      description: "In the file picker that opens, navigate to and select the folder where you extracted the extension source code.",
      icon: Save,
    },
    {
      title: "Step 7 – Start capturing job listings",
      description: "Pin the extension to your toolbar, click the button in the top right of this page to copy your Extension ID, and start capturing jobs from LinkedIn, Indeed, or Glassdoor!",
      icon: ChevronRight,
    },
  ];

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full animate-in fade-in duration-500 pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-sage-light border border-charcoal/15 rounded-[24px] p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-8 h-8 rounded-[10px] bg-white border border-charcoal/10 flex items-center justify-center shadow-sm shrink-0">
              <Puzzle size={16} className="text-charcoal" />
            </div>
            <h1 className="text-[18px] font-black text-charcoal tracking-tight leading-none">
              Browser Extension
            </h1>
          </div>
          <p className="text-[12.5px] font-medium text-charcoal/60 leading-relaxed max-w-lg">
            Capture job listings directly from LinkedIn, Indeed, and Glassdoor without manual data entry.
          </p>
        </div>

        {/* Extension ID Button Block */}
        {user && (
          <div className="shrink-0 bg-white border border-charcoal/15 rounded-[16px] p-2.5 shadow-sm flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-charcoal/40 uppercase tracking-widest leading-none mb-1">Your EXT ID</span>
              {user.extensionId ? (
                <span className="font-mono text-[12px] font-extrabold text-charcoal leading-none">{user.extensionId}</span>
              ) : (
                <span className="text-[11px] font-bold text-charcoal/40 leading-none">Not generated</span>
              )}
            </div>
            {user.extensionId ? (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(user.extensionId);
                  toast.success("Extension ID copied");
                }}
                className="w-7 h-7 flex items-center justify-center bg-charcoal/5 hover:bg-charcoal/10 text-charcoal rounded-lg transition-colors cursor-pointer"
                title="Copy ID"
              >
                <Copy size={12} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                onClick={ensureExtensionId}
                className="px-3 py-1.5 bg-charcoal hover:bg-charcoal/90 text-white text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
              >
                Generate
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-charcoal/15 rounded-[24px] overflow-hidden shadow-sm flex flex-col">
        <div className="px-5 py-4 border-b border-charcoal/10 bg-sage-light/50">
          <h2 className="text-[14px] font-extrabold text-charcoal tracking-tight flex items-center gap-2">
            Setup Guide
          </h2>
        </div>
        
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          <div className="grid gap-4">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-3.5 items-start group">
                <div className="shrink-0 w-8 h-8 rounded-[10px] bg-charcoal/5 border border-charcoal/10 flex items-center justify-center text-charcoal/50 transition-all group-hover:bg-charcoal/[0.07] group-hover:text-charcoal group-hover:border-charcoal/20">
                  <step.icon size={14} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col gap-0.5 pt-1">
                  <h3 className="text-[13px] font-extrabold text-charcoal tracking-tight leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-[12px] font-medium text-charcoal/60 leading-snug">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 p-4 bg-sage-light border border-charcoal/15 rounded-[16px] flex gap-3.5 items-center">
            <div className="shrink-0 w-8 h-8 rounded-full bg-white border border-charcoal/20 flex items-center justify-center text-charcoal shadow-sm">
              <Settings size={14} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-extrabold text-charcoal tracking-tight leading-tight">Setup your Extension ID</p>
              <p className="text-[12px] font-medium text-charcoal/60 leading-snug mt-0.5">
                After installing, copy your <strong className="text-charcoal font-extrabold">Extension ID</strong> from the top right and paste it into the extension settings.
              </p>
            </div>
          </div>

          <div className="pt-5 mt-1 border-t border-charcoal/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-[13px] font-extrabold text-charcoal mb-0.5">Get the latest version</p>
              <p className="text-[12px] font-medium text-charcoal/60">Source code available on GitHub.</p>
            </div>
            <a 
              href="https://github.com/Akshatgupta000/HustleMap-extension" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <button 
                className="w-full sm:w-auto bg-charcoal hover:bg-charcoal/90 text-white font-bold flex items-center justify-center gap-2 h-9 px-5 rounded-[12px] transition-all cursor-pointer text-[12px] shadow-[2px_2px_0px_0px_#1c1c1c] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
              >
                View on GitHub
                <ExternalLink size={14} strokeWidth={2.5} />
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
