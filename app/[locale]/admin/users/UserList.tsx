"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import RoleDropdown from "./RoleDropdown";
import { getPageLabel } from "@/lib/utils/getPageLabel";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export default function UserList({
  users,
  totalUsers,
  currentUserId,
  locale,
}: {
  users: UserWithRole[];
  totalUsers: number;
  currentUserId: string | null;
  locale: string;
}) {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [userPages, setUserPages] = useState<Map<string, string>>(new Map());

  const fetchPresence = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_online_users', {
      timeout_seconds: 30,
    });

    if (error) {
      console.error('Error fetching presence:', error);
      return;
    }

    const ids = new Set<string>();
    const pages = new Map<string, string>();
    data?.forEach((row: any) => {
      ids.add(row.user_id);
      pages.set(row.user_id, row.current_page || '/');
    });
    setOnlineUserIds(ids);
    setUserPages(pages);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    fetchPresence();

    // Subscribe to broadcast from other clients
    const channel = supabase.channel('presence', {
      config: { broadcast: { self: true } },
    });

    channel.on('broadcast', { event: 'presence' }, () => {
      fetchPresence();
    });

    channel.subscribe();

    // Poll every 5s as backup
    const interval = setInterval(fetchPresence, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchPresence]);

  return (
    <main className="flex-grow px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-12 space-y-4">
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-sm font-semibold uppercase tracking-wider text-nordic-dark/50 mb-2">
        <div className="col-span-4">User Details</div>
        <div className="col-span-3">Role & Status</div>
        <div className="col-span-3">Performance</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {users.map((user) => {
        const isOnline = onlineUserIds.has(user.id);
        
        return (
          <div 
            key={user.id}
            className={`group relative rounded-lg p-5 bg-white shadow-sm border border-gray-100 transition-all flex flex-col md:grid md:grid-cols-12 gap-4 items-center hover:bg-background-light`}
          >
            <div className="col-span-12 md:col-span-4 flex items-center w-full">
              <div className="relative flex-shrink-0">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.full_name || ''}
                    className="h-12 w-12 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
                    <span className="material-symbols-outlined text-nordic-dark/50">person</span>
                  </div>
                )}
                {isOnline && (
                  <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
                )}
              </div>
              <div className="ml-4 overflow-hidden">
                <div className="text-sm font-bold text-nordic-dark truncate">{user.full_name || 'Unknown User'}</div>
                <div className="text-xs text-nordic-dark/70 truncate">{user.email}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 inline-block rounded bg-orange-100 text-orange-700 font-medium">
                    ID: #{user.id.slice(0, 8).toUpperCase()}
                  </span>
                  {isOnline && userPages.has(user.id) && (
                    <span className="text-[10px] px-2 py-0.5 inline-flex items-center gap-1 rounded bg-hint-of-green/50 text-mosque">
                      <span className="material-icons" style={{ fontSize: '15px' }}>location_on</span>
                      {getPageLabel(userPages.get(user.id) || '/', locale)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-3 w-full flex items-center justify-between md:justify-start gap-4">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                user.role === 'admin' ? 'bg-nordic-dark text-white' : 'bg-mosque/10 text-mosque'
              }`}>
                {user.role === 'admin' ? 'Administrator' : 'User'}
              </span>
              <div className="flex items-center text-xs text-nordic-dark/60">
                <span className="material-icons text-[14px] mr-1 text-mosque">check_circle</span>
                Active
              </div>
            </div>

            <div className="col-span-12 md:col-span-3 w-full grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-nordic-dark/50">Properties</div>
                <div className="text-sm font-semibold text-nordic-dark">-</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-nordic-dark/50">Joined</div>
                <div className="text-sm font-semibold text-nordic-dark">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <RoleDropdown 
              userId={user.id} 
              currentRole={user.role} 
              isFirst={false} 
            />
          </div>
        );
      })}
    </main>
  );
}
