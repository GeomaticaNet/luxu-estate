"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";

const HEARTBEAT_INTERVAL = 5000;

export default function GlobalPresence() {
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendHeartbeat = useCallback(async (currentPage: string) => {
    const supabase = createClient();
    await supabase.rpc('update_user_presence', { p_current_page: currentPage });
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        sendHeartbeat(pathname);

        // Setup broadcast channel
        const channel = supabase.channel('presence', {
          config: { broadcast: { self: true } },
        });

        channel.subscribe();

        // Heartbeat interval
        intervalRef.current = setInterval(() => {
          sendHeartbeat(pathname);
          channel.send({ type: 'broadcast', event: 'presence', payload: {} });
        }, HEARTBEAT_INTERVAL);

        // Cleanup on unmount
        return () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          supabase.removeChannel(channel);
        };
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        sendHeartbeat(pathname);
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname, sendHeartbeat]);

  return null;
}
