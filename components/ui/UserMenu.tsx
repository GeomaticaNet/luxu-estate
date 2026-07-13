"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useFavoritesContext } from "@/hooks/FavoritesContext";

interface UserMenuProps {
  avatarUrl?: string | null;
  fullName?: string | null;
  email?: string | null;
  logoutText?: string;
  isAdmin?: boolean;
  inAdminArea?: boolean;
}

export function UserMenu({ avatarUrl, fullName, email, logoutText = "Logout", isAdmin, inAdminArea }: UserMenuProps) {
  const supabase = createClient();
  const t = useTranslations("Settings");
  const [isOpen, setIsOpen] = useState(false);
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
    window.location.href = "/";
  };

  const displayName = fullName || email?.split("@")[0] || "User";

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
              alt={displayName}
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
        <div className="absolute right-0 mt-2 min-w-44 w-max max-w-64 rounded-lg bg-white shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User info header */}
          <div className="px-3 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-nordic-dark truncate">{displayName}</p>
            {email && (
              <p className="text-xs text-nordic-dark/50 truncate mt-0.5">{email}</p>
            )}
          </div>

          {isAdmin && !inAdminArea && (
            <Link
              href="/admin/properties"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-nordic-dark hover:bg-mosque/10 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-gray-400">admin_panel_settings</span>
              Administración
            </Link>
          )}
          {isAdmin && inAdminArea && (
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-nordic-dark hover:bg-mosque/10 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-gray-400">public</span>
              Zona pública
            </Link>
          )}
          <Link
            href="/favorites"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-nordic-dark hover:bg-mosque/10 transition-colors"
          >
            <span className="material-icons text-sm text-red-400">favorite</span>
            <span>Favoritos</span>
            {favoritesCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                {favoritesCount}
              </span>
            )}
          </Link>
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-nordic-dark hover:bg-mosque/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-gray-400">settings</span>
            {t("title")}
          </Link>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-nordic-dark hover:bg-mosque/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-gray-400">logout</span>
            Salir
          </button>
        </div>
      )}
    </div>
  );
}
