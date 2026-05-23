"use client";

import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";

interface AdminNavbarProps {
  userEmail?: string;
  userAvatar?: string | null;
}

export function AdminNavbar({ userEmail, userAvatar }: AdminNavbarProps) {
  const pathname = usePathname();
  
  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/properties", label: "Listings" },
    { href: "/admin/users", label: "Users" },
    { href: "#", label: "Inquiries" },
  ];

  const isActive = (href: string) => {
    if (href === "#") return false;
    return pathname.includes(href);
  };

  return (
    <nav className="bg-white border-b border-nordic-dark/5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
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

        {/* Right: Search, Notifications, Profile */}
        <div className="flex items-center gap-5">
          <button className="text-nordic-dark/60 hover:text-mosque transition-colors">
            <span className="material-symbols-outlined text-xl">search</span>
          </button>
          <button className="text-nordic-dark/60 hover:text-mosque transition-colors relative">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          <button className="flex items-center gap-2 ml-2">
            <div className="h-8 w-8 rounded-full bg-nordic-dark/10 flex items-center justify-center overflow-hidden border border-nordic-dark/10">
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-nordic-dark/60 text-lg">person</span>
              )}
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
