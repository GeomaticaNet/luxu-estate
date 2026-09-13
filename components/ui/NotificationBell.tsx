"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      if (cancelled) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setCount(0);
        return;
      }
      const res = await fetch("/api/leads/unread");
      if (cancelled) return;
      if (res.ok) {
        const data = await res.json();
        setCount(data.count || 0);
      }
    }

    fetchCount();

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
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

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
