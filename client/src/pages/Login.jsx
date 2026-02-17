import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "../lib/api";
import { setAuth } from "../lib/auth";
import toast from "react-hot-toast";

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (response) => {
      setAuth(response.data.token, response.data.user);
      toast.success("Logged in successfully!");

      // Notify parent component of successful login
      if (onLoginSuccess) {
        onLoginSuccess();
      }

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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-black p-6">
        <div className="mb-6">
          <h1 className="page-title text-black mb-1.5">Sign in</h1>
          <p className="helper-text text-black">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block form-label text-black mb-1.5">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-1.5 body-text border border-black focus:border-gray-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block form-label text-black mb-1.5">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-1.5 body-text border border-black focus:border-gray-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-black text-white py-2 form-label hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-center helper-text text-black">
          Don't have an account?{" "}
          <Link to="/register" className="underline hover:no-underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
