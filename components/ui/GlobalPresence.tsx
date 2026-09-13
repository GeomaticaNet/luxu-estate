"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";

const HEARTBEAT_INTERVAL = 30000;
const CHECK_SUSPENSION_INTERVAL = 30000;

export default function GlobalPresence() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const supabase = useMemo(() => createClient(), []);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkRef = useRef<NodeJS.Timeout | null>(null);
  const [showSuspendedToast, setShowSuspendedToast] = useState(false);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const sendHeartbeat = useCallback(async (currentPage: string) => {
    await supabase.rpc("update_user_presence", { p_current_page: currentPage });
  }, [supabase]);

  const checkIfSuspended = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_roles")
      .select("active")
      .eq("user_id", user.id)
      .single();

    if (error) return;

    if (data && data.active === false) {
      setShowSuspendedToast(true);
      try {
        await signOutAction();
      } catch {
        // redirect() throws — expected
      }
      window.location.href = "/";
    }
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;

    const clearTimers = () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (checkRef.current) { clearInterval(checkRef.current); checkRef.current = null; }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (cancelled) return;
      clearTimers();

      if (session?.user) {
        sendHeartbeat(pathnameRef.current);
        intervalRef.current = setInterval(() => {
          sendHeartbeat(pathnameRef.current);
        }, HEARTBEAT_INTERVAL);
        checkRef.current = setInterval(() => {
          checkIfSuspended();
        }, CHECK_SUSPENSION_INTERVAL);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimers();
    };
  }, [supabase, sendHeartbeat, checkIfSuspended]);

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
