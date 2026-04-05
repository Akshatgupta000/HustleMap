import { Chrome, Download, Settings, Monitor, Save, ExternalLink, ChevronRight, Puzzle } from "lucide-react";
import { Button } from "../components/ui/button";

export default function BrowserExtension() {
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
      description: "Pin the extension to your toolbar, enter your Extension ID from the sidebar, and start capturing jobs from LinkedIn, Indeed, or Glassdoor!",
      icon: ChevronRight,
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#e8e6e1] flex items-center justify-center shadow-soft">
            <Puzzle size={20} className="text-indigo-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#37352f] tracking-tight">
            Browser Extension
          </h1>
        </div>
        <p className="text-[14px] text-[#6b6b6b] leading-relaxed max-w-2xl">
          Capture job listings directly from LinkedIn, Indeed, and Glassdoor without manual data entry. 
          Our extension saves structured details and screenshots directly to your HustleMap dashboard.
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-[#e8e6e1] rounded-2xl overflow-hidden shadow-soft">
        <div className="px-6 py-5 border-b border-[#f0ede8]">
          <h2 className="text-[16px] font-bold text-[#37352f] tracking-tight flex items-center gap-2">
            HustleMap Job Capture Setup Guide
          </h2>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="grid gap-8">
            <div className="grid gap-6">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-5 items-start group">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-[#f7f6f3] border border-[#e8e6e1] flex items-center justify-center text-[#6b6b6b] shadow-sm transition-colors group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600">
                    <step.icon size={18} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    <h3 className="text-[14.5px] font-bold text-[#37352f] tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-[13.5px] text-[#6b6b6b] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-5 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-4 items-center">
              <div className="shrink-0 w-9 h-9 rounded-full bg-white border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
                <Settings size={16} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-amber-900 tracking-tight">Setup your Extension ID</p>
                <p className="text-[12.5px] text-amber-800/80 leading-relaxed">
                  After installing, copy your unique <strong className="text-amber-900">Extension ID</strong> from the dashboard sidebar and paste it into the extension settings.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#f0ede8] flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <p className="text-[14px] font-bold text-[#37352f] mb-1">Get the latest version</p>
                <p className="text-[13px] text-[#6b6b6b]">The extension source code is available on GitHub.</p>
              </div>
              <a 
                href="https://github.com/Akshatgupta000/HustleMap-extension" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button 
                  variant="default"
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 h-11 px-6 rounded-xl shadow-md transition-all hover:scale-[1.02]"
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
