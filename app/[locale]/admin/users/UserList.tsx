"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import RoleDropdown from "./RoleDropdown";
import { getPageLabel } from "@/lib/utils/getPageLabel";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  roles: string[];
  active: boolean;
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
  const t = useTranslations("Admin");
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [userPages, setUserPages] = useState<Map<string, string>>(new Map());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const visibleUsers = users.filter((u) => !deletedIds.has(u.id));

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
    <>
      <div className="flex-grow w-full pb-12 space-y-4">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-sm font-semibold uppercase tracking-wider text-nordic-dark/50 mb-2">
        <div className="col-span-4">{t("user_details_header")}</div>
        <div className="col-span-3">{t("role_status_header")}</div>
        <div className="col-span-3">{t("performance_header")}</div>
        <div className="col-span-2 text-right">{t("actions")}</div>
      </div>

      {visibleUsers.map((user) => {
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
                  <div className="text-sm font-bold text-nordic-dark truncate">{user.full_name || t("unknown_user")}</div>
                  <div className="text-xs text-nordic-dark/70 truncate">{user.email}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 inline-block rounded bg-orange-100 text-orange-700 font-medium">
                      {t("id_prefix")} #{user.id.slice(0, 8).toUpperCase()}
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
              <div className="flex flex-wrap items-center gap-1.5">
                {user.roles.includes('admin') && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-nordic-dark text-white">
                    {t("administrator_role")}
                  </span>
                )}
                {user.roles.includes('agent') && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-mosque text-white">
                    {t("agent_role")}
                  </span>
                )}
                {user.roles.length === 0 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-mosque/10 text-mosque">
                    {t("user_role")}
                  </span>
                )}
              </div>
              <div className={`flex items-center text-xs ${user.active ? 'text-nordic-dark/60' : 'text-red-500'}`}>
                <span className={`material-icons text-[14px] mr-1 ${user.active ? 'text-mosque' : 'text-red-500'}`}>
                  {user.active ? 'check_circle' : 'cancel'}
                </span>
                {user.active ? t("active_status") : t("inactive")}
              </div>
            </div>

            <div className="col-span-12 md:col-span-3 w-full grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-nordic-dark/50">{t("properties_header")}</div>
                <div className="text-sm font-semibold text-nordic-dark">-</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-nordic-dark/50">{t("joined_header")}</div>
                <div className="text-sm font-semibold text-nordic-dark">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

              <RoleDropdown 
                userId={user.id} 
                roles={user.roles} 
                currentUserId={currentUserId}
                active={user.active}
                isFirst={false} 
                onDeleted={(id) => setDeletedIds((prev) => { const next = new Set(prev); next.add(id); return next; })}
              />
          </div>
        );
      })}
    </div>
  </>);
}
