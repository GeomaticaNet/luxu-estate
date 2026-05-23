import { createServerClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import UserList from "./UserList";
import { routing } from '@/i18n/routing';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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

  const formattedUsers: UserWithRole[] = users?.map((u: any) => ({
    id: u.id,
    email: u.email || 'N/A',
    full_name: u.full_name || null,
    avatar_url: u.avatar_url || null,
    role: u.role,
    created_at: u.created_at,
  })) || [];

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <header className="w-full pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-wide text-nordic-dark">User Directory</h1>
            <p className="text-nordic-dark/60 mt-1 text-sm tracking-wide">Manage user access and roles for your properties.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative group w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-nordic-dark/40 group-focus-within:text-mosque text-xl">search</span>
              </div>
              <input 
                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-md bg-white text-nordic-dark shadow-soft placeholder-nordic-dark/30 focus:ring-2 focus:ring-mosque focus:bg-white transition-all text-sm"
                placeholder="Search by name, email..."
                type="text"
              />
            </div>
            <button className="inline-flex items-center justify-center px-4 py-2.5 border border-mosque text-sm font-medium rounded-md text-mosque bg-transparent hover:bg-mosque/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mosque transition-colors whitespace-nowrap">
              <span className="material-icons text-lg mr-2">add</span>
              Add User
            </button>
          </div>
        </div>
        <div className="mt-8 flex gap-6 border-b border-nordic-dark/10 overflow-x-auto">
          <button className="pb-3 text-sm font-medium text-mosque border-b-2 border-mosque font-semibold whitespace-nowrap">All Users</button>
          <button className="pb-3 text-sm font-medium text-nordic-dark/60 hover:text-nordic-dark whitespace-nowrap">Users</button>
          <button className="pb-3 text-sm font-medium text-nordic-dark/60 hover:text-nordic-dark whitespace-nowrap">Admins</button>
        </div>
      </header>

      <UserList users={formattedUsers} currentUserId={currentUserId} locale={locale} />

      <footer className="mt-auto border-t border-nordic-dark/5 bg-background-light py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-nordic-dark/60">
                Showing <span className="font-medium text-nordic-dark">1</span> to <span className="font-medium text-nordic-dark">{formattedUsers.length}</span> of <span className="font-medium text-nordic-dark">{formattedUsers.length}</span> users
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
