import { createServerClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export default async function AdminUsersPage() {
  const t = await getTranslations("Admin");
  const supabase = await createServerClient();

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
                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-white text-nordic-dark shadow-soft placeholder-nordic-dark/30 focus:ring-2 focus:ring-mosque focus:bg-white transition-all text-sm"
                placeholder="Search by name, email..."
                type="text"
              />
            </div>
            <button className="inline-flex items-center justify-center px-4 py-2.5 border border-mosque text-sm font-medium rounded-lg text-mosque bg-transparent hover:bg-mosque/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mosque transition-colors whitespace-nowrap">
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

      <main className="flex-grow px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-12 space-y-4">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-sm font-semibold uppercase tracking-wider text-nordic-dark/50 mb-2">
          <div className="col-span-4">User Details</div>
          <div className="col-span-3">Role & Status</div>
          <div className="col-span-3">Performance</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {formattedUsers.map((user, index) => {
          const isFirst = index === 0;
          
          return (
            <div 
              key={user.id}
              className={`group relative rounded-lg p-5 shadow-sm border transition-all flex flex-col md:grid md:grid-cols-12 gap-4 items-center ${
                isFirst 
                  ? "bg-hint-of-green border-transparent" 
                  : "bg-white border-gray-100 hover:bg-hint-of-green"
              }`}
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
                  {isFirst && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
                  )}
                </div>
                <div className="ml-4 overflow-hidden">
                  <div className="text-sm font-bold text-nordic-dark truncate">{user.full_name || 'Unknown User'}</div>
                  <div className="text-xs text-nordic-dark/70 truncate">{user.email}</div>
                  <div className={`mt-1 text-[10px] px-2 py-0.5 inline-block rounded ${
                    isFirst ? 'bg-white/50 text-nordic-dark/60' : 'bg-gray-50 text-nordic-dark/50'
                  }`}>
                    ID: #{user.id.slice(0, 8).toUpperCase()}
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

              <div className="col-span-12 md:col-span-2 w-full flex justify-end">
                <button className="inline-flex items-center px-4 py-2 border border-gray-200 bg-transparent text-xs font-medium rounded-lg text-nordic-dark/70 hover:border-nordic-dark hover:text-nordic-dark transition-colors w-full md:w-auto justify-center">
                  Change Role
                  <span className="material-icons text-[16px] ml-2">expand_more</span>
                </button>
              </div>
            </div>
          );
        })}
      </main>

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
