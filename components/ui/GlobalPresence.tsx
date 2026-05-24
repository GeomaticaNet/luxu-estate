"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";

const HEARTBEAT_INTERVAL = 5000;
const CHECK_SUSPENSION_INTERVAL = 3000;

export default function GlobalPresence() {
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showSuspendedToast, setShowSuspendedToast] = useState(false);

  const sendHeartbeat = useCallback(async (currentPage: string) => {
    const supabase = createClient();
    await supabase.rpc('update_user_presence', { p_current_page: currentPage });
  }, []);

  const checkIfSuspended = useCallback(async (userId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('user_roles')
      .select('active')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error checking suspension:', error);
      return;
    }
    
    if (data && data.active === false) {
      setShowSuspendedToast(true);
      await supabase.auth.signOut();
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let checkInterval: NodeJS.Timeout | null = null;

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

        // Check suspension every 3 seconds
        checkInterval = setInterval(() => {
          checkIfSuspended(user.id);
        }, CHECK_SUSPENSION_INTERVAL);

        // Cleanup on unmount
        return () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (checkInterval) clearInterval(checkInterval);
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
        if (checkInterval) clearInterval(checkInterval);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [pathname, sendHeartbeat, checkIfSuspended]);

  return (
    <>
      {showSuspendedToast && (
        <div className="fixed top-4 left-4 z-[9999] max-w-sm">
          <div className="bg-nordic-dark text-white px-5 py-4 rounded-lg shadow-2xl border-l-4 border-red-500 flex items-start gap-3 animate-slide-in">
            <span className="material-icons text-red-400 text-xl">block</span>
            <div>
              <p className="font-semibold text-sm">Usuario suspendido</p>
              <p className="text-xs text-white/70 mt-0.5">Contacte con el administrador</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
