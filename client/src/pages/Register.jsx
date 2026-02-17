import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "../lib/api";
import { setAuth } from "../lib/auth";
import toast from "react-hot-toast";

export default function Register({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (response) => {
      setAuth(response.data.token, response.data.user);
      toast.success("Account created successfully!");

      // Notify parent component of successful registration
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }

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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-black p-6">
        <div className="mb-6">
          <h1 className="page-title text-black mb-1.5">Create account</h1>
          <p className="helper-text text-black">
            Start tracking your job applications
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block form-label text-black mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-1.5 body-text border border-black focus:border-gray-500 focus:outline-none"
              placeholder="John Doe"
            />
          </div>

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
            disabled={registerMutation.isPending}
            className="w-full bg-black text-white py-2 form-label hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registerMutation.isPending
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center helper-text text-black">
          Already have an account?{" "}
          <Link to="/login" className="underline hover:no-underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
