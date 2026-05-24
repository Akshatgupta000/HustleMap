import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "../lib/api";
import { setAuth } from "../lib/auth";
import toast from "react-hot-toast";
import { Input } from "../components/ui/input";
import { Sparkles, CheckCircle } from "lucide-react";

export default function Register({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (response) => {
      setAuth(response.data.token, response.data.user);
      toast.success("Account created successfully!");
      if (onRegisterSuccess) onRegisterSuccess();
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Registration failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const isPending = registerMutation.isPending;

  const perks = [
    "Track all your job applications",
    "Log interview difficulty & questions",
    "Build your Interview Summary",
  ];

  return (
      <div className="min-h-screen bg-sage flex items-center justify-center p-4 relative overflow-hidden">
 
      <div className="w-full max-w-[420px] relative z-10 py-3">
        {/* Logo */}
        <div className="text-center mb-3">
          <Link to="/" className="inline-flex items-center no-underline">
            <span className="text-[24px] font-bold text-charcoal tracking-tight">HustleMap</span>
          </Link>
        </div>
 
        {/* Card */}
        <div className="bg-white border border-charcoal/15 rounded-[20px] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-8 pt-5 pb-4 border-b border-charcoal/15/50">
            <h1 className="text-[20px] font-extrabold text-charcoal tracking-tight mb-1">
              Create your account
            </h1>
            <p className="text-[13px] text-charcoal/60 mb-2">
              Start tracking your job search for free
            </p>
 
            {/* Perks row */}
            <div className="flex flex-col gap-1">
              {perks.map((perk) => (
                <div key={perk} className="flex items-center gap-2">
                  <CheckCircle size={12} className="text-charcoal shrink-0" />
                  <span className="text-[12px] text-charcoal/60">{perk}</span>
                </div>
              ))}
            </div>
          </div>
 
          {/* Body */}
          <div className="px-6 sm:px-8 pt-4 pb-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-[12.5px] font-semibold text-charcoal mb-[3px] tracking-tight">
                  Full Name
                </label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
 
              <div>
                <label className="block text-[12.5px] font-semibold text-charcoal mb-[3px] tracking-tight">
                  Email
                </label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
 
              <div>
                <label className="block text-[12.5px] font-semibold text-charcoal mb-[3px] tracking-tight">
                  Password
                </label>
                <Input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
 
              <button
                type="submit"
                disabled={isPending}
                className={`mt-1 w-full rounded-[11px] py-[9.5px] px-5 text-[14px] font-bold tracking-tight transition-all border ${
                  isPending
                    ? "bg-charcoal/5 text-charcoal/40 border-charcoal/15 cursor-not-allowed"
                    : "bg-charcoal text-white border-charcoal cursor-pointer shadow-sm hover:bg-charcoal/90 hover:scale-[1.02]"
                }`}
              >
                {isPending ? "Creating account…" : "Create Free Account"}
              </button>
            </form>
 
            <div className="mt-3.5 pt-3 border-t border-charcoal/15/50 text-center">
              <p className="text-[12.5px] text-charcoal/60">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-charcoal font-semibold no-underline hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
