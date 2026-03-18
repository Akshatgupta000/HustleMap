import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "../lib/api";
import { setAuth } from "../lib/auth";
import toast from "react-hot-toast";
import { Input } from "../components/ui/input";
import { Sparkles } from "lucide-react";

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (response) => {
      setAuth(response.data.token, response.data.user);
      toast.success("Logged in successfully!");
      if (onLoginSuccess) onLoginSuccess();
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Login failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const isPending = loginMutation.isPending;

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow blobs */}
      <div
        className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-[50%] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.10) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[15%] right-[10%] w-[300px] h-[300px] rounded-[50%] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(139,92,246,0.07) 0%, transparent 70%)" }}
      />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo mark */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 no-underline">
            <div className="w-[34px] h-[34px] rounded-[10px] bg-white border border-[#e8e6e1] flex items-center justify-center shadow-md">
              <Sparkles size={16} className="text-indigo-500" />
            </div>
            <span className="text-[16px] font-bold text-[#37352f] tracking-tight">HustleMap</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#e8e6e1] rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-[#f0ede8]">
            <h1 className="text-[22px] font-extrabold text-[#37352f] tracking-tight mb-1.5">
              Welcome back
            </h1>
            <p className="text-[13.5px] text-[#6b6b6b]">
              Sign in to your HustleMap account
            </p>
          </div>

          {/* Card body */}
          <div className="px-8 pt-7 pb-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
              <div>
                <label className="block text-[13px] font-semibold text-[#37352f] mb-[7px] tracking-tight">
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
                <label className="block text-[13px] font-semibold text-[#37352f] mb-[7px] tracking-tight">
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
                className={`mt-1 w-full text-white border-none rounded-[11px] py-[11px] px-5 text-[14.5px] font-semibold tracking-tight transition-all ${
                  isPending
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-500 cursor-pointer shadow-[0_2px_12px_rgba(99,102,241,0.28)] hover:bg-indigo-600 hover:scale-[1.02]"
                }`}
              >
                {isPending ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="mt-[22px] pt-5 border-t border-[#f0ede8] text-center">
              <p className="text-[13px] text-[#6b6b6b]">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-indigo-500 font-semibold no-underline hover:underline"
                >
                  Create one free
                </Link>
              </p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
