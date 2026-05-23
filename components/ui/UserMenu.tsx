"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/routing";
import Image from "next/image";

interface UserMenuProps {
  avatarUrl?: string | null;
  fullName?: string | null;
  logoutText: string;
}

export function UserMenu({ avatarUrl, fullName, logoutText }: UserMenuProps) {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className="flex items-center gap-6">
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
      <button
        onClick={handleLogout}
        className="flex items-center justify-center bg-white/10 p-1.5 rounded-full border border-gray-200/20 hover:bg-white/20 transition-colors"
        title={logoutText}
      >
        <span className="material-icons text-sm text-nordic-dark/70">logout</span>
      </button>
    </div>
  );
}
