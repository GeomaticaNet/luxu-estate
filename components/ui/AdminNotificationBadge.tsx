"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";

interface AdminNotificationBadgeProps {
  isAdmin: boolean;
}

export function AdminNotificationBadge({ isAdmin }: AdminNotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;

    const supabase = createClient();

    async function fetchCount() {
      const { count } = await supabase
        .from("contact_leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      if (count !== null) setUnreadCount(count);
    }

    fetchCount();

    const channel = supabase
      .channel("public-admin-badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_leads" },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin/messages"
      className="relative text-nordic-dark/60 hover:text-mosque transition-colors"
      title="Messages"
    >
      <span className="material-icons text-lg">notifications</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight shadow-lg">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
