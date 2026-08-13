"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { User } from "@supabase/supabase-js";
import { UserMenu } from "./UserMenu";
import { NotificationBell } from "./NotificationBell";
import { Link } from "@/i18n/routing";

interface NavbarAuthProps {
  initialUser: User | null;
  avatarUrl?: string | null;
  fullName?: string | null;
  loginText: string;
  isAdmin?: boolean;
  canAccessAdmin?: boolean;
}

export function NavbarAuth({ initialUser, avatarUrl, fullName, loginText, isAdmin, canAccessAdmin }: NavbarAuthProps) {
  // Stable instance across renders — creating it here would re-subscribe
  // auth listeners on every render and trigger an infinite loop when logged in.
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(initialUser);
  const [roles, setRoles] = useState<{ isAdmin: boolean; canAccessAdmin: boolean }>({
    isAdmin: isAdmin ?? false,
    canAccessAdmin: canAccessAdmin ?? false,
  });

  useEffect(() => {
    let cancelled = false;

    const refreshRoles = async (nextUser: User) => {
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", nextUser.id)
        .single();
      if (cancelled) return;
      const roleList: string[] = userRole?.role ?? [];
      setRoles({
        isAdmin: roleList.includes("admin"),
        canAccessAdmin: roleList.includes("admin") || roleList.includes("agent"),
      });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        await refreshRoles(nextUser);
      } else {
        setRoles({ isAdmin: isAdmin ?? false, canAccessAdmin: canAccessAdmin ?? false });
      }
    });

    // Initial role fetch so admin/agent menu shows without a F5.
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return;
      if (user) {
        setUser(user);
        refreshRoles(user);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [isAdmin, canAccessAdmin, supabase]);

  if (!user) {
    return (
      <Link href="/login" className="px-4 py-1.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-mosque/90 transition-colors shadow-sm">
        {loginText}
      </Link>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1">
        {!roles.isAdmin && !roles.canAccessAdmin && <NotificationBell />}
        <UserMenu 
          avatarUrl={user.user_metadata?.avatar_url ?? avatarUrl} 
          fullName={user.user_metadata?.full_name ?? fullName}
          email={user.email}
          isAdmin={roles.isAdmin}
          canAccessAdmin={roles.canAccessAdmin}
          role={roles.isAdmin ? "admin" : roles.canAccessAdmin ? "agent" : "user"}
        />
      </div>
    </>
  );
}
