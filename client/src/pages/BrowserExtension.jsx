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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Puzzle size={20} className="text-slate-900" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Browser Extension
            </h1>
          </div>
          <p className="text-[14px] text-slate-500 leading-relaxed max-w-2xl">
            Capture job listings directly from LinkedIn, Indeed, and Glassdoor without manual data entry. 
            Our extension saves structured details and screenshots directly to your HustleMap dashboard.
          </p>
        </div>

        {/* Extension ID Button Block */}
        {user && (
          <div className="shrink-0 self-start bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Your EXT ID</span>
              {user.extensionId ? (
                <span className="font-mono text-[13px] font-bold text-slate-900">{user.extensionId}</span>
              ) : (
                <span className="text-[12px] font-medium text-slate-400">Not generated</span>
              )}
            </div>
            {user.extensionId ? (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(user.extensionId);
                  toast.success("Extension ID copied");
                }}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                title="Copy ID"
              >
                <Copy size={14} />
              </button>
            ) : (
              <button
                onClick={ensureExtensionId}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-colors"
              >
                Generate
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200/50">
          <h2 className="text-[16px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
            HustleMap Job Capture Setup Guide
          </h2>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="grid gap-8">
            <div className="grid gap-6">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-5 items-start group">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm transition-all group-hover:bg-slate-100 group-hover:border-slate-900/30 group-hover:text-slate-900">
                    <step.icon size={18} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    <h3 className="text-[14.5px] font-bold text-slate-900 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-[13.5px] text-slate-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-5 bg-accent-yellow/5 border border-accent-yellow/20 rounded-2xl flex gap-4 items-center shadow-sm">
              <div className="shrink-0 w-9 h-9 rounded-full bg-white border border-accent-yellow/30 flex items-center justify-center text-accent-yellow shadow-sm">
                <Settings size={16} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-accent-yellow tracking-tight">Setup your Extension ID</p>
                <p className="text-[12.5px] text-accent-yellow/80 leading-relaxed">
                  After installing, copy your unique <strong className="text-accent-yellow font-bold">Extension ID</strong> using the button at the top right of this page and paste it into the extension settings.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <p className="text-[14px] font-bold text-slate-900 mb-1">Get the latest version</p>
                <p className="text-[13px] text-slate-500">The extension source code is available on GitHub.</p>
              </div>
              <a 
                href="https://github.com/Akshatgupta000/HustleMap-extension" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button 
                  variant="default"
                  className="w-full sm:w-auto bg-slate-900 hover:brightness-110 text-white font-bold flex items-center justify-center gap-2 h-11 px-6 rounded-xl shadow-sm transition-all hover:scale-[1.02]"
                >
                  View Extension on GitHub
                  <ExternalLink size={16} />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
