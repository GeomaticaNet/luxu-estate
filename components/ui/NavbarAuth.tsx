"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { UserMenu } from "./UserMenu";
import { Link } from "@/i18n/routing";

interface NavbarAuthProps {
  initialUser: User | null;
  avatarUrl?: string | null;
  fullName?: string | null;
  loginText: string;
  isAdmin?: boolean;
}

export function NavbarAuth({ initialUser, avatarUrl, fullName, loginText, isAdmin }: NavbarAuthProps) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(initialUser);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!user) {
    return (
      <Link href="/login" className="px-4 py-1.5 rounded-lg bg-mosque text-white text-sm font-medium hover:bg-mosque/90 transition-colors shadow-sm">
        {loginText}
      </Link>
    );
  }

  return (
    <UserMenu 
      avatarUrl={user.user_metadata?.avatar_url ?? avatarUrl} 
      fullName={user.user_metadata?.full_name ?? fullName}
      email={user.email}
      isAdmin={isAdmin}
    />
  );
}
