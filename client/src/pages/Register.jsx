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
    <div className="min-h-screen bg-notion-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow blobs */}
      <div
        className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-[50%] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(167,139,250,0.10) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[10%] left-[8%] w-[280px] h-[280px] rounded-[50%] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(167,139,250,0.07) 0%, transparent 70%)" }}
      />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 no-underline">
            <div className="w-[34px] h-[34px] rounded-[10px] bg-notion-card border border-notion-border flex items-center justify-center shadow-soft">
              <Sparkles size={16} className="text-accent-purple" />
            </div>
            <span className="text-[16px] font-bold text-notion-text tracking-tight">HustleMap</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-notion-card border border-notion-border rounded-[20px] shadow-soft overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-notion-border/50">
            <h1 className="text-[22px] font-extrabold text-notion-text tracking-tight mb-1.5">
              Create your account
            </h1>
            <p className="text-[13.5px] text-notion-muted mb-[18px]">
              Start tracking your job search for free
            </p>

            {/* Perks row */}
            <div className="flex flex-col gap-[7px]">
              {perks.map((perk) => (
                <div key={perk} className="flex items-center gap-2">
                  <CheckCircle size={13} className="text-accent-purple shrink-0" />
                  <span className="text-[12.5px] text-notion-muted">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 sm:px-8 pt-7 pb-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
              <div>
                <label className="block text-[13px] font-semibold text-notion-text mb-[7px] tracking-tight">
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
                <label className="block text-[13px] font-semibold text-notion-text mb-[7px] tracking-tight">
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
                <label className="block text-[13px] font-semibold text-notion-text mb-[7px] tracking-tight">
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
                className={`mt-1 w-full text-notion-bg border-none rounded-[11px] py-[11px] px-5 text-[14.5px] font-bold tracking-tight transition-all ${
                  isPending
                    ? "bg-notion-muted cursor-not-allowed"
                    : "bg-accent-purple cursor-pointer shadow-soft hover:brightness-110 hover:scale-[1.02]"
                }`}
              >
                {isPending ? "Creating account…" : "Create Free Account"}
              </button>
            </form>

            <div className="mt-[22px] pt-5 border-t border-notion-border/50 text-center">
              <p className="text-[13px] text-notion-muted">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-accent-purple font-semibold no-underline hover:underline"
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
