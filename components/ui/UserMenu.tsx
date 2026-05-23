"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/routing";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface UserMenuProps {
  avatarUrl?: string | null;
  fullName?: string | null;
  logoutText: string;
}

export function UserMenu({ avatarUrl, fullName, logoutText }: UserMenuProps) {
  const supabase = createClient();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div ref={ref} className="relative ml-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-2 border-l border-nordic-dark/10"
      >
        <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-mosque transition-all relative flex items-center justify-center">
          {avatarUrl ? (
            <Image 
              fill
              sizes="36px"
              alt={fullName || "Profile"} 
              className="object-cover" 
              src={avatarUrl}
            />
          ) : (
            <span className="material-icons text-nordic-dark/50">person</span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white/70 backdrop-blur-lg shadow-xl border border-white/20 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50/50 transition-colors font-medium"
          >
            <span className="material-icons text-base">logout</span>
            <span>{logoutText}</span>
          </button>
        </div>
      )}
    </div>
  );
}
