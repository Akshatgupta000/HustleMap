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
      console.log("[Login] Success response from server:", response.data);
      if (response.data.token) {
        console.log("[Login] Token received and being stored.");
        setAuth(response.data.token, response.data.user);
        toast.success("Logged in successfully!");
        if (onLoginSuccess) onLoginSuccess();
        navigate("/dashboard");
      } else {
        console.error("[Login] No token in success response:", response.data);
        toast.error("Login failed: No authentication token received.");
      }
    },
    onError: (error) => {
      console.error("[Login] Error from server:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      if (error.code === 'ERR_NETWORK') {
        console.error("[Login] Network error - potentially CORS or incorrect VITE_API_URL or backend is down.");
      }
      toast.error(error.response?.data?.error || "Login failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const isPending = loginMutation.isPending;

  return (
      <div className="min-h-screen bg-sage flex items-center justify-center p-6 relative overflow-hidden">

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo mark */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center no-underline">
            <span className="text-[24px] font-bold text-charcoal tracking-tight">HustleMap</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white border border-charcoal/15 rounded-[20px] shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-charcoal/15/50">
            <h1 className="text-[22px] font-extrabold text-charcoal tracking-tight mb-1.5">
              Welcome back
            </h1>
            <p className="text-[13.5px] text-charcoal/60">
              Sign in to your HustleMap account
            </p>
          </div>

          {/* Card body */}
          <div className="px-6 sm:px-8 pt-7 pb-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
              <div>
                <label className="block text-[13px] font-semibold text-charcoal mb-[7px] tracking-tight">
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
                <label className="block text-[13px] font-semibold text-charcoal mb-[7px] tracking-tight">
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
                className={`mt-1 w-full rounded-[11px] py-[11px] px-5 text-[14.5px] font-bold tracking-tight transition-all border ${
                  isPending
                    ? "bg-charcoal/5 text-charcoal/40 border-charcoal/15 cursor-not-allowed"
                    : "bg-charcoal text-white border-charcoal cursor-pointer shadow-sm hover:bg-charcoal/90 hover:scale-[1.02]"
                }`}
              >
                {isPending ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div className="mt-[22px] pt-5 border-t border-charcoal/15/50 text-center">
              <p className="text-[13px] text-charcoal/60">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-charcoal font-semibold no-underline hover:underline"
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
