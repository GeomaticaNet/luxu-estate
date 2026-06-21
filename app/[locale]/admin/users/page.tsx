import { createServerClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import UserList from "./UserList";
import { Link } from "@/i18n/routing";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  active: boolean;
  created_at: string;
}

export default async function AdminUsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string; search?: string }>;
}) {
  const { locale } = await params;
  const { tab, search: searchQuery } = await searchParams;
  const t = await getTranslations("Admin");
  const supabase = await createServerClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const currentUserId = currentUser?.id || null;

  const { data: users, error } = await supabase
    .rpc('get_admin_users');

  if (error) {
    console.error('Error fetching users:', error);
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-red-600">Error loading users: {error.message}</div>

      </div>
    );
  }

  let formattedUsers: UserWithRole[] = users?.map((u: any) => ({
    id: u.id,
    email: u.email || 'N/A',
    full_name: u.full_name || null,
    avatar_url: u.avatar_url || null,
    role: u.role,
    active: u.active ?? true,
    created_at: u.created_at,
  })) || [];

  // Filter by tab and search
  const activeTab = tab || 'all';
  const search = (searchQuery || '').toLowerCase();
  const filteredUsers = formattedUsers.filter(user => {
    // Tab filter
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'users' && user.role === 'user') ||
      (activeTab === 'admins' && user.role === 'admin');
    
    // Search filter
    const matchesSearch = !search || 
      user.full_name?.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search);
    
    return matchesTab && matchesSearch;
  });

  const tabs = [
    { id: 'all', labelKey: 'tab_all_users' },
    { id: 'users', labelKey: 'tab_users' },
    { id: 'admins', labelKey: 'tab_admins' },
  ];

  return (
    <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-nordic-dark tracking-wide">{t("user_directory")}</h1>
          <p className="text-gray-500 mt-1 tracking-wide">{t("user_directory_desc")}</p>
        </div>
        <div className="flex items-center gap-3">
          <form action="/admin/users" method="GET" className="relative group">
            <input type="hidden" name="tab" value={activeTab} />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-nordic-dark/40 group-focus-within:text-mosque text-xl">search</span>
            </div>
            <input 
              name="search"
              defaultValue={searchQuery || ''}
              className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-white text-nordic-dark shadow-soft placeholder-nordic-dark/30 focus:ring-2 focus:ring-mosque focus:bg-white transition-all text-sm"
              placeholder={t("search_users_placeholder")}
              type="text"
            />
          </form>
          <button className="inline-flex items-center justify-center px-4 py-2.5 border border-mosque text-sm font-medium rounded-lg text-mosque bg-transparent hover:bg-mosque/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mosque transition-colors whitespace-nowrap">
            <span className="material-icons text-lg mr-2">add</span>
            {t("add_user")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-nordic-dark/10 overflow-x-auto mb-8">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/admin/users?tab=${tab.id}`}
            className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-mosque border-b-2 border-mosque font-semibold'
                : 'text-nordic-dark/60 hover:text-nordic-dark'
            }`}
          >
            {t(tab.labelKey)}
          </Link>
        ))}
      </div>

      <UserList users={filteredUsers} totalUsers={formattedUsers.length} currentUserId={currentUserId} locale={locale} />

      <div className="mt-8 border-t border-gray-100 py-6 flex items-center justify-between">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {search
                ? t("showing_users_for", { count: filteredUsers.length, total: formattedUsers.length, query: searchQuery || "" })
                : t("showing_users", { count: filteredUsers.length, total: formattedUsers.length })
              }
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
