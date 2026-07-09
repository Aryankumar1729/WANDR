"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }
      
      toast.success("OTP sent to your email!");
      setStep("otp");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Invalid OTP");
      }
      
      login(data.access_token, data.user);
      toast.success("Email verified! Account created.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <main className="flex-grow flex items-center justify-center px-margin-mobile md:px-margin-desktop py-12 relative overflow-hidden">
        {/* Subtle Ambient Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary-container rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-24 w-64 h-64 bg-surface-container-high rounded-full blur-3xl"></div>
        </div>

        {/* Centered Auth Card */}
        <div className="w-full max-w-[440px] bg-surface-container-lowest border border-outline-variant rounded-xl p-8 md:p-10 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] relative z-10 transition-all duration-300">
          {/* Logo Area */}
          <div className="flex flex-col items-center mb-10">
            <div className="mb-6 flex items-center justify-center">
              <img src="/assets/logo.png" alt="WANDR Logo" className="h-48 w-auto object-contain" />
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">Start your journey.</p>
          </div>

          {step === "details" ? (
            <form className="space-y-5" onSubmit={handleSignup}>
              {/* Full Name Field */}
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="fullName">
                  Full Name
                </label>
                <div className="relative group">
                  <input
                    className="w-full h-12 bg-surface-container-low border-transparent border focus:border-outline focus:bg-surface-container-lowest focus:ring-0 rounded-lg px-4 font-body-md text-body-md text-on-surface transition-all placeholder:text-on-secondary-container/50 focus-within:scale-[1.01]"
                    id="fullName"
                    placeholder="e.g. John Doe"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="email">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    className="w-full h-12 bg-surface-container-low border-transparent border focus:border-outline focus:bg-surface-container-lowest focus:ring-0 rounded-lg px-4 font-body-md text-body-md text-on-surface transition-all placeholder:text-on-secondary-container/50 focus-within:scale-[1.01]"
                    id="email"
                    placeholder="e.g. wanderer@explore.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="password">
                  Password
                </label>
                <div className="relative group">
                  <input
                    className="w-full h-12 bg-surface-container-low border-transparent border focus:border-outline focus:bg-surface-container-lowest focus:ring-0 rounded-lg px-4 font-body-md text-body-md text-on-surface transition-all placeholder:text-on-secondary-container/50 focus-within:scale-[1.01]"
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <p className="text-[11px] text-on-surface-variant italic ml-1 mt-1">Must be at least 8 characters long.</p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative group">
                  <input
                    className="w-full h-12 bg-surface-container-low border-transparent border focus:border-outline focus:bg-surface-container-lowest focus:ring-0 rounded-lg px-4 font-body-md text-body-md text-on-surface transition-all placeholder:text-on-secondary-container/50 focus-within:scale-[1.01]"
                    id="confirmPassword"
                    placeholder="••••••••"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                className="w-full h-12 bg-primary text-on-primary rounded-full font-body-lg text-body-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Continue"}
              </button>
            </form>
          ) : (
            <form className="space-y-5 animate-fade-in" onSubmit={handleVerifyOtp}>
              <div className="text-center mb-4">
                <h3 className="font-title-lg text-title-lg text-on-surface">Verify your email</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  We've sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="otp">
                  Enter 6-Digit OTP
                </label>
                <div className="relative group">
                  <input
                    className="w-full h-12 bg-surface-container-low border-transparent border focus:border-outline focus:bg-surface-container-lowest focus:ring-0 rounded-lg px-4 font-body-md text-body-md text-on-surface transition-all text-center tracking-widest text-lg placeholder:text-on-secondary-container/50"
                    id="otp"
                    placeholder="------"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                </div>
              </div>

              <button
                className="w-full h-12 bg-primary text-on-primary rounded-full font-body-lg text-body-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>
              
              <div className="text-center mt-4">
                <button
                  type="button"
                  className="font-label-md text-label-md text-secondary hover:text-primary transition-colors"
                  onClick={() => setStep("details")}
                >
                  Edit email or resend code
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant"></div>
            </div>
            <div className="relative flex justify-center text-label-md uppercase">
              <span className="bg-surface-container-lowest px-4 text-on-surface-variant font-label-md">Or continue with</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 h-11 border border-outline-variant rounded-full font-body-md text-body-md text-on-surface hover:bg-surface-container transition-colors active:scale-95">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-3 h-11 border border-outline-variant rounded-full font-body-md text-body-md text-on-surface hover:bg-surface-container transition-colors active:scale-95">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.96.95-2.45 1.72-3.72 1.72-1.45 0-2.25-.43-3.23-.43-.98 0-2.02.45-3.26.45-2.17 0-4.66-2.65-4.66-6.42 0-3.32 2.1-5.06 4.07-5.06 1.07 0 1.95.43 2.76.43.76 0 1.4-.41 2.62-.41.97 0 1.96.34 2.7.98-2.68 1.4-2.25 5.3.47 6.42-.48 1.25-1.07 2.06-1.75 2.75zM12.03 7.25c-.02-2.15 1.73-3.95 3.73-3.95.14 2.33-2.13 4.24-3.73 3.95z"></path>
              </svg>
              Apple
            </button>
          </div>

          {/* Registration Footer */}
          <p className="text-center mt-10 font-body-md text-body-md text-on-surface-variant">
            Already have an account? 
            <Link className="text-primary font-bold hover:underline decoration-2 underline-offset-4 ml-1" href="/login">
              Log In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
