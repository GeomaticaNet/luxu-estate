"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleLogin = async (provider: "google" | "github") => {
    setLoading(provider);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || location.origin;
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });
  };

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
          <h1 className="text-3xl font-bold tracking-tight text-nordic mb-2">Welcome to LuxeEstate</h1>
          <p className="text-nordic/60">Unlock exclusive properties worldwide.</p>
        </div>
        
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 border border-black/5">
          {error === 'suspended' && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-start gap-3">
              <span className="material-icons text-red-500 text-xl">block</span>
              <div>
                <p className="font-semibold text-red-700 text-sm">Usuario suspendido</p>
                <p className="text-red-600/80 text-xs mt-0.5">Tu cuenta ha sido suspendida. Contacta con el administrador.</p>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <button 
              onClick={() => handleLogin("google")}
              disabled={loading !== null}
              className="group w-full flex items-center justify-center gap-3 bg-white border border-gray-200/80 rounded-xl p-3.5 text-nordic font-semibold text-[15px] transition-all duration-300 hover:bg-gray-50 hover:shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading === "google" ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
            <button 
              onClick={() => handleLogin("github")}
              disabled={loading !== null}
              className="group w-full flex items-center justify-center gap-3 bg-white border border-gray-200/80 rounded-xl p-3.5 text-nordic font-semibold text-[15px] transition-all duration-300 hover:bg-gray-50 hover:shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading === "github" ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <svg className="w-5 h-5 fill-current text-nordic" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                </svg>
              )}
              <span>Continue with GitHub</span>
            </button>
          </div>
          <p className="mt-8 text-center text-[13px] text-nordic/60">
            Don't have an account? 
            <a className="font-semibold text-mosque hover:opacity-80 transition-opacity ml-1" href="#">Sign up</a>
          </p>
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
