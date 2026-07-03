"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "login" | "signup" | "forgot";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  const handleOAuthLogin = async (provider: "google") => {
    setLoading(provider);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || location.origin;
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setMessage("");

    if (!email.trim() || !password) {
      setFormError("Email and password are required");
      return;
    }

    setLoading("email");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setFormError(signInError.message === "Invalid login credentials"
        ? "Invalid email or password"
        : signInError.message);
      setLoading(null);
      return;
    }

    router.refresh();
    router.push("/");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setMessage("");

    if (!email.trim() || !password || !fullName.trim()) {
      setFormError("All fields are required");
      setLoading(null);
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    setLoading("signup");
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    if (signUpError) {
      setFormError(signUpError.message);
      setLoading(null);
      return;
    }

    // Auto-confirm user via service role (dev only)
    fetch("/api/auth/confirm-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    }).catch(() => {});

    setMessage("Account created! You can now sign in.");
    setLoading(null);
    setMode("login");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setMessage("");

    if (!email.trim()) {
      setFormError("Email is required");
      return;
    }

    setLoading("forgot");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${siteUrl}/auth/callback` }
    );

    if (resetError) {
      setFormError(resetError.message);
      setLoading(null);
      return;
    }

    setMessage("Check your email to reset your password.");
    setLoading(null);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setFormError("");
    setMessage("");
  };

  const title = mode === "login" ? "Welcome to LuxeEstate"
    : mode === "signup" ? "Create your account"
    : "Reset your password";

  const subtitle = mode === "login" ? "Unlock exclusive properties worldwide."
    : mode === "signup" ? "Join us and start exploring."
    : "We'll send you a reset link.";

  return (
    <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-background-light">
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D9ECC8]/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-mosque/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-mosque rounded-2xl mb-6 shadow-lg shadow-mosque/20 text-white">
            <span className="material-symbols-outlined text-3xl">volunteer_activism</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-nordic mb-2">{title}</h1>
          <p className="text-nordic/60">{subtitle}</p>
        </div>

        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 border border-black/5">
          {/* Suspended alert */}
          {error === 'suspended' && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-start gap-3">
              <span className="material-icons text-red-500 text-xl">block</span>
              <div>
                <p className="font-semibold text-red-700 text-sm">Usuario suspendido</p>
                <p className="text-red-600/80 text-xs mt-0.5">Tu cuenta ha sido suspendida. Contacta con el administrador.</p>
              </div>
            </div>
          )}

          {/* Form error */}
          {formError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
              {formError}
            </div>
          )}

          {/* Success message */}
          {message && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
              {message}
            </div>
          )}

          {/* Google OAuth */}
          {mode !== "forgot" && (
            <button
              onClick={() => handleOAuthLogin("google")}
              disabled={loading !== null}
              className="group w-full flex items-center justify-center gap-3 bg-white border border-gray-200/80 rounded-xl p-3.5 text-nordic font-semibold text-[15px] transition-all duration-300 hover:bg-gray-50 hover:shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading === "google" ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          )}

          {/* Divider */}
          {mode !== "forgot" && (
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400 font-medium">or continue with email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}

          {/* Email/Password Form */}
          {mode === "login" && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nordic-dark mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nordic-dark mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading === "email"}
                className="w-full py-2.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-mosque/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading === "email" && <span className="material-icons text-sm animate-spin">refresh</span>}
                Sign In
              </button>
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-mosque hover:text-mosque/80 transition-colors font-medium"
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-mosque hover:text-mosque/80 transition-colors font-medium"
                >
                  Don't have an account? <span className="font-semibold">Sign up!</span>
                </button>
              </div>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nordic-dark mb-1">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nordic-dark mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nordic-dark mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nordic-dark mb-1">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading === "signup"}
                className="w-full py-2.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-mosque/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading === "signup" && <span className="material-icons text-sm animate-spin">refresh</span>}
                Create Account
              </button>
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-mosque hover:text-mosque/80 transition-colors font-medium"
                >
                  Already have an account? <span className="font-semibold">Sign in</span>
                </button>
              </div>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div>
                <label className="block text-sm font-medium text-nordic-dark mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-nordic-dark placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading === "forgot"}
                className="w-full py-2.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-mosque/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading === "forgot" && <span className="material-icons text-sm animate-spin">refresh</span>}
                Send Reset Link
              </button>
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-mosque hover:text-mosque/80 transition-colors font-medium"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <nav className="flex justify-center gap-6 text-[12px] font-medium text-nordic/40">
            <a className="hover:text-nordic/70 transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-nordic/70 transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-nordic/70 transition-colors" href="#">Help Center</a>
          </nav>
        </div>
      </div>
    </main>
  );
}
