"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/routing";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useFavoritesContext } from "@/hooks/FavoritesContext";
import { ChangePasswordModal } from "@/components/auth/ChangePasswordModal";

interface UserMenuProps {
  avatarUrl?: string | null;
  fullName?: string | null;
  logoutText?: string;
  isAdmin?: boolean;
  inAdminArea?: boolean;
}

export function UserMenu({ avatarUrl, fullName, logoutText = "Logout", isAdmin, inAdminArea }: UserMenuProps) {
  const supabase = createClient();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { count: favoritesCount } = useFavoritesContext();

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
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 bg-white/10 px-2 py-1.5 rounded-full border border-gray-200/20 hover:bg-white/20 transition-colors"
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
        <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {isAdmin && !inAdminArea && (
            <Link
              href="/admin/properties"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-nordic-dark hover:bg-mosque/10 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-gray-400">admin_panel_settings</span>
              Administración
            </Link>
          )}
          {isAdmin && inAdminArea && (
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-nordic-dark hover:bg-mosque/10 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-gray-400">public</span>
              Zona pública
            </Link>
          )}
          <Link
            href="/favorites"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-nordic-dark hover:bg-mosque/10 transition-colors"
          >
            <span className="material-icons text-sm text-red-400">favorite</span>
            <span>Favoritos</span>
            {favoritesCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                {favoritesCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              setIsPasswordModalOpen(true);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-nordic-dark hover:bg-mosque/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-gray-400">lock</span>
            Cambiar contraseña
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-nordic-dark hover:bg-mosque/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-gray-400">logout</span>
            Salir
          </button>
        </div>
      )}

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
