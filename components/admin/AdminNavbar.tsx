"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { UserMenu } from "@/components/ui/UserMenu";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { createClient } from "@/lib/supabase/client";

interface AdminNavbarProps {
  userEmail?: string;
  userFullName?: string | null;
  userAvatar?: string | null;
  isAdmin?: boolean;
  canAccessAdmin?: boolean;
}

export function AdminNavbar({ userEmail, userFullName, userAvatar, isAdmin, canAccessAdmin }: AdminNavbarProps) {
  const pathname = usePathname();
  const t = useTranslations("Admin");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    async function fetchUnreadCount() {
      const { count: newLeads } = await supabase
        .from("contact_leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      // Client messages not yet read by staff (agent opened the thread → marked read)
      const { count: unreadUserMsgs } = await supabase
        .from("lead_messages")
        .select("*", { count: "exact", head: true })
        .eq("sender_type", "user")
        .eq("is_read", false);
      setUnreadCount((newLeads || 0) + (unreadUserMsgs || 0));
    }

    fetchUnreadCount();

    const channel = supabase
      .channel("admin-badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_leads" },
        () => {
          fetchUnreadCount();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lead_messages" },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const navItems = [
    { href: "/admin/properties", label: t("properties") },
    { href: "/admin/messages", label: t("messages_title") || "Messages" },
    ...(isAdmin ? [{ href: "/admin/users", label: t("users") }] : []),
    { href: "/admin/account", label: t("account") || "Cuenta" },
  ];

  const isActive = (href: string) => {
    if (href === "#") return false;
    return pathname.includes(href);
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
                key={item.href}
                href={item.href}
                className={`px-1 py-2 text-sm font-medium transition-colors relative ${
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

        {/* Right: Language, Search, Notifications, Avatar */}
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <button className="text-nordic-dark/60 hover:text-mosque transition-colors">
            <span className="material-symbols-outlined text-xl">search</span>
          </button>
          <Link
            href="/admin/messages"
            className="text-nordic-dark/60 hover:text-mosque transition-colors relative"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight shadow-lg">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          
          <UserMenu
            avatarUrl={userAvatar}
            fullName={userFullName}
            email={userEmail}
            isAdmin={isAdmin}
            canAccessAdmin={canAccessAdmin}
            inAdminArea={true}
            role={isAdmin ? "admin" : "agent"}
          />
        </div>
      </div>
    </nav>
  );
}
