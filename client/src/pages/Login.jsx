import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "../lib/api";
import { setAuth } from "../lib/auth";
import toast from "react-hot-toast";
import { Input } from "../components/ui/input";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [view, setView] = useState("login"); // 'login' | 'forgot-password' | 'verify-otp' | 'change-password'
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (response) => {
      console.log("[Login] Success response from server:", response.data);
      if (response.data.token) {
        console.log("[Login] Token received and being stored.");
        setAuth(response.data.token, response.data.user);

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

  const forgotPasswordMutation = useMutation({
    mutationFn: authAPI.forgotPassword,
    onSuccess: () => {
      toast.success("OTP sent to your email!");
      setView("verify-otp");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to send OTP");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: authAPI.verifyOtp,
    onSuccess: () => {
      toast.success("OTP verified successfully!");
      setView("change-password");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Invalid OTP");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authAPI.resetPassword,
    onSuccess: () => {
      toast.success("Password reset successfully! Please sign in with your new password.");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setView("login");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to reset password");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    forgotPasswordMutation.mutate({ email: resetEmail });
  };

  const handleVerifyOtpSubmit = (e) => {
    e.preventDefault();
    verifyOtpMutation.mutate({ email: resetEmail, otp: otp.trim() });
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    resetPasswordMutation.mutate({ email: resetEmail, otp: otp.trim(), newPassword });
  };

  const isPending = loginMutation.isPending;

  return (
    <div className="min-h-screen bg-sage flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-[400px] relative z-10 py-4">
        {/* Logo mark */}
        <div className="text-center mb-4">
          <Link to="/" className="inline-flex items-center no-underline">
            <span className="text-[24px] font-bold text-charcoal tracking-tight">HustleMap</span>
          </Link>
        </div>
 
        {/* Card */}
        <div className="bg-white border border-charcoal/15 rounded-[20px] shadow-sm overflow-hidden transition-all duration-300">
          {/* Card header */}
          <div className="px-6 sm:px-8 pt-5 pb-3.5 border-b border-charcoal/15/50">
            {view === "login" && (
              <>
                <h1 className="text-[20px] font-extrabold text-charcoal tracking-tight mb-1">
                  Welcome back
                </h1>
                <p className="text-[13px] text-charcoal/60">
                  Sign in to your HustleMap account
                </p>
              </>
            )}
            {view === "forgot-password" && (
              <>
                <h1 className="text-[20px] font-extrabold text-charcoal tracking-tight mb-1">
                  Forgot Password
                </h1>
                <p className="text-[13px] text-charcoal/60">
                  Enter your email to receive a verification OTP code
                </p>
              </>
            )}
            {view === "verify-otp" && (
              <>
                <h1 className="text-[20px] font-extrabold text-charcoal tracking-tight mb-1">
                  Verify OTP
                </h1>
                <p className="text-[13px] text-charcoal/60">
                  Enter the OTP code sent to your email
                </p>
              </>
            )}
            {view === "change-password" && (
              <>
                <h1 className="text-[20px] font-extrabold text-charcoal tracking-tight mb-1">
                  Change Password
                </h1>
                <p className="text-[13px] text-charcoal/60">
                  Choose a secure new password
                </p>
              </>
            )}
          </div>
 
          {/* Card body */}
          <div className="px-6 sm:px-8 pt-4 pb-5">
            {view === "login" && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
                <div>
                  <label className="block text-[12.5px] font-semibold text-charcoal mb-[4px] tracking-tight">
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
                  <div className="flex justify-between items-center mb-[4px]">
                    <label className="block text-[12.5px] font-semibold text-charcoal tracking-tight">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(formData.email);
                        setView("forgot-password");
                      }}
                      className="text-[11.5px] font-semibold text-charcoal/60 hover:text-charcoal no-underline hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
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
                  className={`mt-1.5 w-full rounded-[11px] py-[9.5px] px-5 text-[14px] font-bold tracking-tight transition-all border ${
                    isPending
                      ? "bg-charcoal/5 text-charcoal/40 border-charcoal/15 cursor-not-allowed"
                      : "bg-charcoal text-white border-charcoal cursor-pointer shadow-sm hover:bg-charcoal/90 hover:scale-[1.02]"
                  }`}
                >
                  {isPending ? "Signing in…" : "Sign In"}
                </button>
              </form>
            )}

            {view === "forgot-password" && (
              <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-[14px]">
                <div>
                  <label className="block text-[12.5px] font-semibold text-charcoal mb-[4px] tracking-tight">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className={`mt-1.5 w-full rounded-[11px] py-[9.5px] px-5 text-[14px] font-bold tracking-tight transition-all border ${
                    forgotPasswordMutation.isPending
                      ? "bg-charcoal/5 text-charcoal/40 border-charcoal/15 cursor-not-allowed"
                      : "bg-charcoal text-white border-charcoal cursor-pointer shadow-sm hover:bg-charcoal/90 hover:scale-[1.02]"
                  }`}
                >
                  {forgotPasswordMutation.isPending ? "Sending OTP…" : "Send OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="mt-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-charcoal/60 hover:text-charcoal transition-colors py-1 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </form>
            )}

            {view === "verify-otp" && (
              <form onSubmit={handleVerifyOtpSubmit} className="flex flex-col gap-[14px]">
                <div>
                  <label className="block text-[12.5px] font-semibold text-charcoal mb-[4px] tracking-tight">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    disabled
                    value={resetEmail}
                    className="bg-charcoal/5 cursor-not-allowed opacity-75"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-charcoal mb-[4px] tracking-tight">
                    One-Time Password (OTP)
                  </label>
                  <Input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifyOtpMutation.isPending}
                  className={`mt-1.5 w-full rounded-[11px] py-[9.5px] px-5 text-[14px] font-bold tracking-tight transition-all border ${
                    verifyOtpMutation.isPending
                      ? "bg-charcoal/5 text-charcoal/40 border-charcoal/15 cursor-not-allowed"
                      : "bg-charcoal text-white border-charcoal cursor-pointer shadow-sm hover:bg-charcoal/90 hover:scale-[1.02]"
                  }`}
                >
                  {verifyOtpMutation.isPending ? "Verifying OTP…" : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="mt-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-charcoal/60 hover:text-charcoal transition-colors py-1 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </form>
            )}

            {view === "change-password" && (
              <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-[14px]">
                <div>
                  <label className="block text-[12.5px] font-semibold text-charcoal mb-[4px] tracking-tight">
                    New Password
                  </label>
                  <Input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-charcoal mb-[4px] tracking-tight">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className={`mt-1.5 w-full rounded-[11px] py-[9.5px] px-5 text-[14px] font-bold tracking-tight transition-all border ${
                    resetPasswordMutation.isPending
                      ? "bg-charcoal/5 text-charcoal/40 border-charcoal/15 cursor-not-allowed"
                      : "bg-charcoal text-white border-charcoal cursor-pointer shadow-sm hover:bg-charcoal/90 hover:scale-[1.02]"
                  }`}
                >
                  {resetPasswordMutation.isPending ? "Resetting Password…" : "Reset Password"}
                </button>

                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="mt-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-charcoal/60 hover:text-charcoal transition-colors py-1 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </form>
            )}
 
            {view === "login" && (
              <div className="mt-4 pt-3.5 border-t border-charcoal/15/50 text-center">
                <p className="text-[12.5px] text-charcoal/60">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-charcoal font-semibold no-underline hover:underline"
                  >
                    Create one free
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
