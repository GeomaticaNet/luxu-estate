"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/routing";

export function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-2 pl-4 ml-2 border-l border-nordic-dark/10 text-nordic-dark/70 hover:text-red-500 transition-colors"
      title="Cerrar sesión"
    >
      <span className="material-icons text-[20px]">logout</span>
    </button>
  );
}
