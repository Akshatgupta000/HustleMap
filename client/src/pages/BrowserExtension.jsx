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
      title: "Step 1 – Download the extension",
      description: "Click the 'Download .zip' button at the top right of this Setup Guide.",
      icon: Download,
    },
    {
      title: "Step 2 – Extract the ZIP file",
      description: "Locate the downloaded ZIP file on your computer and extract (unzip) it into a new folder.",
      icon: ExternalLink,
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
      description: "In the file picker that opens, navigate to and select the folder where you extracted the extension.",
      icon: Save,
    },
    {
      title: "Step 7 – Connect & Start Capturing",
      description: "Pin the extension to your toolbar, copy your Extension ID from the panel on the right, paste it into the extension settings, and start capturing jobs!",
      icon: ChevronRight,
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1150px] mx-auto w-full animate-in fade-in duration-500 pb-8 px-4 sm:px-0">
      
      {/* Left Column: Video Setup Guide */}
      <div className="lg:w-[58%] w-full flex flex-col gap-5 order-1 lg:order-2 self-start">
        <div className="border border-charcoal/15 rounded-[24px] overflow-hidden shadow-sm flex flex-col w-full">
          <video 
            className="w-full h-auto outline-none" 
            controls 
            preload="metadata"
          >
            <source src="https://res.cloudinary.com/dxm904hac/video/upload/v1779728330/Video_Project_1_1_s2cuhz.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Browser Extension Header Box (Moved Below Video) */}
        <div className="flex flex-col gap-4 bg-sage-light border border-charcoal/15 rounded-[20px] p-5 shadow-sm shrink-0 max-w-[380px]">
          <div>
            <h1 className="text-[20px] font-black text-charcoal tracking-tight leading-none">
              Browser Extension
            </h1>
          </div>

          {/* Extension ID Button Block */}
          {user && (
            <div className="shrink-0 bg-white border border-charcoal/15 rounded-[12px] p-4 shadow-sm flex flex-col gap-2">
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-charcoal/40 uppercase tracking-widest leading-none mb-1.5">Your EXT ID</span>
                {user.extensionId ? (
                  <span className="font-mono text-[14px] font-extrabold text-charcoal leading-none break-all">{user.extensionId}</span>
                ) : (
                  <span className="text-[12px] font-bold text-charcoal/40 leading-none">Not generated</span>
                )}
              </div>
              {user.extensionId ? (
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(user.extensionId);
                    toast.success("Extension ID copied");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-charcoal hover:bg-charcoal/90 text-white rounded-[8px] transition-colors cursor-pointer text-[13px] font-bold mt-1"
                >
                  <Copy size={16} strokeWidth={2.5} /> Copy ID
                </button>
              ) : (
                <button
                  onClick={ensureExtensionId}
                  className="w-full py-2.5 bg-charcoal hover:bg-charcoal/90 text-white text-[13px] font-extrabold rounded-[8px] transition-colors cursor-pointer uppercase tracking-wider mt-1"
                >
                  Generate ID
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Info & Setup Steps */}
      <div className="lg:w-[42%] w-full flex flex-col order-2 lg:order-1 gap-5 h-auto lg:h-[600px]">

        {/* Bottom: Setup Guide Steps (Scrollable) */}
        <div className="bg-white border border-charcoal/15 rounded-[24px] overflow-hidden shadow-sm flex flex-col flex-1 min-h-[300px]">
          <div className="px-5 py-4 border-b border-charcoal/10 bg-sage-light/50 flex items-center justify-between shrink-0">
            <h2 className="text-[18px] font-extrabold text-charcoal tracking-tight flex items-center gap-2">
              Setup Guide
            </h2>
            <a 
              href="https://github.com/Akshatgupta000/HustleMap-extension/archive/refs/heads/main.zip" 
            >
              <button 
                className="bg-charcoal hover:bg-charcoal/90 text-white font-bold flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] transition-all cursor-pointer text-[12px] shadow-[1px_1px_0px_0px_#1c1c1c] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none uppercase tracking-wide"
              >
                Download .zip
                <Download size={14} strokeWidth={2.5} />
              </button>
            </a>
          </div>
          
          <div className="p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
            <div className="grid gap-3">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-3 items-start group">
                  <div className="shrink-0 w-8 h-8 rounded-[8px] bg-charcoal/5 border border-charcoal/10 flex items-center justify-center text-charcoal/50 transition-all group-hover:bg-charcoal/[0.07] group-hover:text-charcoal group-hover:border-charcoal/20">
                    <step.icon size={15} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col pt-0.5">
                    <h3 className="text-[13px] font-extrabold text-charcoal tracking-tight leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-[12px] font-medium text-charcoal/60 leading-snug mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-auto p-3 border-t border-charcoal/10 flex justify-end shrink-0 bg-white">
            <a 
              href="https://github.com/Akshatgupta000/HustleMap-extension" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <button 
                className="bg-white border border-charcoal/15 hover:bg-charcoal/5 text-charcoal font-bold flex items-center justify-center gap-1.5 h-8 px-4 rounded-[8px] transition-all cursor-pointer text-[12px] uppercase tracking-wide"
              >
                View Source
                <ExternalLink size={14} strokeWidth={2.5} />
              </button>
            </a>
          </div>
        </div>
      </div>
      
    </div>
  );
}
