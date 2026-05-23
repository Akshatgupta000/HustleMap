import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, UploadCloud, Loader2, Save, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../lib/api";
import { cn } from "../lib/cn";

// VITE_API_URL handles production vs local base URLs
const API_BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') 
  : "http://localhost:5000";

export default function ProfileNotesPopover({ theme = "light" }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);
  const queryClient = useQueryClient();

  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => authAPI.getUserProfile().then((res) => res.data),
    enabled: isOpen,
  });

  // Sync loaded profile data to local state
  useEffect(() => {
    if (profile) {
      setNotes(profile.generalNotes || "");
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (formData) => authAPI.updateUserProfile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["userProfile"]);
      toast.success("Master Notes saved!");
      setSelectedFile(null); // Clear selected file after successful upload
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Failed to save profile details");
    },
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("generalNotes", notes);
    if (selectedFile) {
      formData.append("resumePdf", selectedFile);
    }
    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="relative flex items-center justify-center" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center transition-colors relative",
          theme === "dark" ? "hover:text-white" : "hover:text-charcoal"
        )}
        title="Master Resume & Notes"
      >
        <FileText className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-[320px] sm:w-[380px] bg-white border-2 border-charcoal rounded-[24px] shadow-[6px_6px_0px_0px_#1c1c1c] p-5 z-50 overflow-hidden flex flex-col gap-4 origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-extrabold text-charcoal tracking-tight">Master Profile</h3>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-charcoal/40" />}
          </div>

          {/* Resume Upload Section */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-charcoal tracking-wide uppercase">Resume (PDF)</label>
            
            {profile?.resumeUrl && !selectedFile && (
              <div className="flex items-center justify-between p-3 bg-sage-light border-2 border-charcoal rounded-[12px] mb-2">
                <span className="text-[13px] font-bold text-charcoal truncate flex-1">
                  Current Resume Saved
                </span>
                <a 
                  href={`${API_BASE}${profile.resumeUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] font-extrabold bg-charcoal text-white px-4 py-1.5 rounded-full hover:bg-charcoal/90 transition-colors shadow-sm"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View
                </a>
              </div>
            )}

            <div className="relative">
              <input 
                type="file" 
                accept="application/pdf"
                id="resumeUpload"
                className="hidden"
                onChange={handleFileChange}
              />
              <label 
                htmlFor="resumeUpload"
                className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-charcoal/40 rounded-[16px] hover:bg-sage hover:border-charcoal transition-colors cursor-pointer text-charcoal/70 hover:text-charcoal group"
              >
                <UploadCloud className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
                <span className="text-[13px] font-bold">
                  {selectedFile ? selectedFile.name : "Click to upload new PDF"}
                </span>
              </label>
            </div>
          </div>

          {/* General Notes Section */}
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-[13px] font-bold text-charcoal tracking-wide uppercase">Quick Notes</label>
            <textarea
              placeholder="Elevator pitch, links, or reminders..."
              className="w-full min-h-[120px] resize-none bg-white border-2 border-charcoal rounded-[16px] p-3 text-[14px] font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-sage placeholder:text-charcoal/30"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Action Footer */}
          <button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending || isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-charcoal text-white rounded-[16px] py-3 text-[14px] font-extrabold tracking-wide hover:bg-charcoal/90 disabled:opacity-50 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            {updateProfileMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Master Profile
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
