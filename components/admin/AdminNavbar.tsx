"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AdminNavbarProps {
  userEmail?: string;
  userAvatar?: string | null;
  isAdmin?: boolean;
}

export function AdminNavbar({ userEmail, userAvatar, isAdmin }: AdminNavbarProps) {
  const pathname = usePathname();
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
  
  const navItems = [
    { href: "/admin/properties", label: "Properties" },
    { href: "/admin/users", label: "Users" },
  ];

  const isActive = (href: string) => {
    if (href === "#") return false;
    return pathname.includes(href);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/40 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-12">
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <span className="material-symbols-outlined text-mosque text-2xl">apartment</span>
            <span className="font-bold text-lg text-nordic-dark tracking-tight">LuxeEstate</span>
          </Link>
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-1 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-mosque border-b-2 border-mosque"
                    : "text-nordic-dark/60 hover:text-mosque"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Search, Notifications, Avatar */}
        <div className="flex items-center gap-5">
          <button className="text-nordic-dark/60 hover:text-mosque transition-colors">
            <span className="material-symbols-outlined text-xl">search</span>
          </button>
          <button className="text-nordic-dark/60 hover:text-mosque transition-colors relative">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          
          {/* Avatar Dropdown */}
          <div ref={ref} className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 bg-white/10 px-2 py-1.5 rounded-full border border-gray-200/20 hover:bg-white/20 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-nordic-dark/10 flex items-center justify-center overflow-hidden border border-nordic-dark/10">
                {userAvatar ? (
                  <img src={userAvatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-nordic-dark/60 text-lg">person</span>
                )}
              </div>
              <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                expand_more
              </span>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white/85 backdrop-blur-lg shadow-xl border border-gray-200/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {isAdmin && (
                  <Link
                    href="/admin/properties"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-nordic-dark hover:bg-gray-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-gray-400">admin_panel_settings</span>
                    Administración
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-nordic-dark hover:bg-gray-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-gray-400">logout</span>
                  Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
