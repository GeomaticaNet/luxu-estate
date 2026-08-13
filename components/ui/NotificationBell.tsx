"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const supabase = createClient();

    async function fetchCount() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCount(0);
        return;
      }
      const res = await fetch("/api/leads/unread");
      if (res.ok) {
        const data = await res.json();
        setCount(data.count || 0);
      }
    }

    fetchCount();

    // Live updates: new agent message arrives (INSERT) or the user reads
    // replies in /messages (UPDATE is_read) — both refresh the badge.
    const channel = supabase
      .channel("user-messages-badge")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lead_messages" },
        () => fetchCount()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "lead_messages" },
        () => fetchCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pathname]);

  return (
    <Link
      href="/messages"
      aria-label="Mensajes"
      className="relative text-nordic-dark/60 hover:text-mosque transition-colors p-1.5"
    >
      <span className="material-symbols-outlined text-xl">notifications</span>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight shadow-lg">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
