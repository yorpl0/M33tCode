import React, { useState } from 'react'
import useAuthStore from '../store/useAuthStore';
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";

export const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(0);
  const [formData, setFormData] = useState({
  username: "",
  email: "",
  password: "",
});


  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.username.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) signup(formData);
  };

  return (<div><Toaster/>
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-r from-[#0442d1] via-[#111a32] to-[#0256dd] text-white">
      {/* Left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <MessageSquare className="size-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-white/60">Get started with your free account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-medium">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-white/40" />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10 bg-white/10 border-white/20 text-white placeholder-white/50"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData,username: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-white/40" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10 bg-white/10 border-white/20 text-white placeholder-white/50"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-white/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10 bg-white/10 border-white/20 text-white placeholder-white/50"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-white/40" />
                  ) : (
                    <Eye className="size-5 text-white/40" />
                  )}
                </button>
              </div>
            </div>

            <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:cursor-pointer"
            disabled={isSigningUp}>
            {isSigningUp ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>

          </form>

          <div className="text-center">
            <p className="text-white/60">
              Already have an account?{" "}
              <Link to="/login" className="link text-white underline hover:cursor-pointer">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right half */}
      <div className="w-full hidden lg:block relative bg-gradient-to-tr from-[#0f172a] via-[#1e3a8a] to-[#2563eb]">
        {/* Reversed blue shape on top */}
        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <path 
            fill="#3b82f6"  // Tailwind's blue-500
            d="M0,0 C200,300 600,500 800,200 L800,800 L0,800 Z"
            transform="scale(1, -1) translate(0, -800)" 
          />
        </svg>

        {/* Original white shape */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <path 
            fill="#3b82f6" 
            d="M0,0 C200,300 600,500 800,200 L800,800 L0,800 Z" 
          />
              
        </svg>
      </div>

    </div>
    </div>
  )
}
export default SignupPage;
