"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";


interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          role,
          user_id,
          created_at,
          users:user_id (
            email,
            raw_user_meta_data
          )
        `);

      if (error) throw error;

      const formattedUsers = data?.map((item: any) => ({
        id: item.user_id,
        email: item.users?.email || 'N/A',
        full_name: item.users?.raw_user_meta_data?.full_name || null,
        avatar_url: item.users?.raw_user_meta_data?.avatar_url || null,
        role: item.role,
        created_at: item.created_at,
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(userId: string, newRole: string) {
    setUpdating(userId);
    setOpenDropdown(null);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setUpdating(null);
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "all" || 
      (activeTab === "admins" && user.role === "admin") ||
      (activeTab === "users" && user.role === "user");
    
    return matchesSearch && matchesTab;
  });

  const tabs = [
    { id: "all", label: "All Users" },
    { id: "users", label: "Users" },
    { id: "admins", label: "Admins" },
  ];

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return "bg-nordic-dark text-white";
      case 'user':
        return "bg-mosque/10 text-mosque";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'user': return 'User';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mosque"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <header className="w-full pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-nordic-dark">User Directory</h1>
            <p className="text-nordic-dark/60 mt-1 text-sm">Manage user access and roles for your properties.</p>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="inline-flex items-center justify-center px-4 py-2.5 border border-mosque text-sm font-medium rounded-lg text-mosque bg-transparent hover:bg-mosque/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mosque transition-colors whitespace-nowrap">
              <span className="material-icons text-lg mr-2">add</span>
              Add User
            </button>
          </div>
        </div>
        <div className="mt-8 flex gap-6 border-b border-nordic-dark/10 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-mosque border-b-2 border-mosque font-semibold"
                  : "text-nordic-dark/60 hover:text-nordic-dark"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-grow px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-12 space-y-4">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-nordic-dark/50 mb-2">
          <div className="col-span-4">User Details</div>
          <div className="col-span-3">Role & Status</div>
          <div className="col-span-3">Performance</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* User Cards */}
        {filteredUsers.map((user, index) => {
          const isFirst = index === 0;
          const isOpen = openDropdown === user.id;
          
          return (
            <div 
              key={user.id}
                className={`group relative rounded-lg p-5 shadow-sm border transition-all flex flex-col md:grid md:grid-cols-12 gap-4 items-center ${
                isFirst 
                  ? "bg-hint-of-green border-transparent" 
                  : "bg-white border-gray-100 hover:bg-hint-of-green"
              }`}
            >
              {/* User Details */}
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

              {/* Role & Status */}
              <div className="col-span-12 md:col-span-3 w-full flex items-center justify-between md:justify-start gap-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
                <div className="flex items-center text-xs text-nordic-dark/60">
                  <span className="material-icons text-[14px] mr-1 text-mosque">check_circle</span>
                  Active
                </div>
              </div>

              {/* Performance */}
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

              {/* Actions */}
              <div className="col-span-12 md:col-span-2 w-full flex justify-end relative">
                <button 
                  onClick={() => setOpenDropdown(isOpen ? null : user.id)}
                  disabled={updating === user.id}
                  className={`inline-flex items-center px-4 py-2 border text-xs font-medium rounded-lg transition-colors w-full md:w-auto justify-center ${
                    isOpen
                      ? "bg-mosque text-white shadow-md"
                      : isFirst 
                        ? "border-nordic-dark/10 bg-white text-nordic-dark hover:bg-nordic-dark hover:text-white"
                        : "border-gray-200 bg-transparent text-nordic-dark/70 hover:border-nordic-dark hover:text-nordic-dark"
                  }`}
                >
                  {updating === user.id ? 'Saving...' : 'Change Role'}
                  <span className="material-icons text-[16px] ml-2">
                    {isOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {/* Dropdown */}
                {isOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 rounded-lg shadow-xl bg-mosque ring-1 ring-black ring-opacity-5 overflow-hidden z-50 origin-top-right">
                    <div className="py-1" role="menu">
                      <button
                        onClick={() => updateRole(user.id, 'admin')}
                        className={`group flex items-center w-full px-4 py-3 text-xs transition-colors ${
                          user.role === 'admin' ? 'text-white font-medium bg-white/10' : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="material-icons text-sm mr-3 text-white/50">shield</span>
                        Administrator
                      </button>
                      <button
                        onClick={() => updateRole(user.id, 'user')}
                        className={`group flex items-center w-full px-4 py-3 text-xs transition-colors ${
                          user.role === 'user' ? 'text-white font-medium bg-white/10' : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="material-icons text-sm mr-3 text-white/50">person</span>
                        User
                      </button>
                      <div className="border-t border-white/10 my-1"></div>
                      <button
                        className="group flex items-center w-full px-4 py-3 text-xs text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-colors"
                      >
                        <span className="material-icons text-sm mr-3 text-red-300">block</span>
                        Suspend User
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-nordic-dark/5 bg-background-light py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-nordic-dark/60">
                Showing <span className="font-medium text-nordic-dark">1</span> to <span className="font-medium text-nordic-dark">{filteredUsers.length}</span> of <span className="font-medium text-nordic-dark">{users.length}</span> users
              </p>
            </div>
            <div>
              <nav aria-label="Pagination" className="relative z-0 inline-flex rounded-lg shadow-none -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md text-sm font-medium text-nordic-dark/50 hover:text-mosque transition-colors">
                  <span className="material-icons text-xl">chevron_left</span>
                </button>
                <button className="z-10 bg-mosque text-white relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg mx-1 shadow-sm">
                  1
                </button>
                <button className="bg-transparent text-nordic-dark/70 hover:bg-white hover:text-mosque relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg mx-1 transition-colors">
                  2
                </button>
                <button className="bg-transparent text-nordic-dark/70 hover:bg-white hover:text-mosque relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg mx-1 transition-colors">
                  3
                </button>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-nordic-dark/40">
                  ...
                </span>
                <button className="bg-transparent text-nordic-dark/70 hover:bg-white hover:text-mosque relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg mx-1 transition-colors">
                  8
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md text-sm font-medium text-nordic-dark/50 hover:text-mosque transition-colors">
                  <span className="material-icons text-xl">chevron_right</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
