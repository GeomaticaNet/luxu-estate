"use client";

import { useState, useRef, useEffect } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { LanguageSelector } from "./LanguageSelector";

interface MobileMenuProps {
  buyLabel: string;
  rentLabel: string;
  sellLabel: string;
  isLoggedIn: boolean;
  loginLabel: string;
}

export function MobileMenu({ buyLabel, rentLabel, sellLabel, isLoggedIn, loginLabel }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type") === "rent" ? "rent" : "buy";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return currentType === "buy" && pathname === "/";
    if (href.startsWith("/?type=rent")) return currentType === "rent";
    return false;
  };

  return (
    <div ref={ref} className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-10 h-10 rounded-lg text-nordic-dark hover:bg-black/5 transition-colors"
        aria-label="Toggle menu"
      >
        <span className="material-icons text-2xl">{open ? "close" : "menu"}</span>
      </button>

      {open && (
        <div className="fixed left-0 right-0 z-50 bg-white shadow-2xl border-t border-gray-100 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ top: "64px" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-1">
            <Link
              href="/#new-in-market"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                isActive("/")
                  ? "bg-mosque/10 text-mosque"
                  : "text-nordic-dark hover:bg-mosque/10"
              }`}
            >
              <span className="material-icons text-xl">home</span>
              {buyLabel}
            </Link>

            <Link
              href="/?type=rent#new-in-market"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                isActive("/?type=rent")
                  ? "bg-mosque/10 text-mosque"
                  : "text-nordic-dark hover:bg-mosque/10"
              }`}
            >
              <span className="material-icons text-xl">real_estate_agent</span>
              {rentLabel}
            </Link>

            <Link
              href="#"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-nordic-dark hover:bg-mosque/10 transition-all"
            >
              <span className="material-icons text-xl">sell</span>
              {sellLabel}
            </Link>

            <div className="border-t border-gray-100 my-3" />

            <Link
              href="/?type=all"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-nordic-dark hover:bg-mosque/10 transition-all"
            >
              <span className="material-icons text-xl">grid_view</span>
              Todas las propiedades
            </Link>

            <Link
              href="/favorites"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-nordic-dark hover:bg-mosque/10 transition-all"
            >
              <span className="material-icons text-xl text-red-400">favorite</span>
              Favoritos
            </Link>

            <div className="border-t border-gray-100 my-3" />

            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-500">Idioma</span>
              <LanguageSelector dropUp />
            </div>

            {!isLoggedIn && (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block w-full text-center px-4 py-3 rounded-xl bg-mosque text-white text-sm font-medium hover:bg-mosque/90 transition-colors shadow-sm"
              >
                {loginLabel}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
