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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mosque"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-light text-nordic-dark mb-8">Usuarios y Roles</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-nordic-muted">Usuario</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-nordic-muted">Email</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-nordic-muted">Rol</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-nordic-muted">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.full_name || ''}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="material-icons text-nordic-dark/50">person</span>
                      </div>
                    )}
                    <span className="font-medium text-nordic-dark">
                      {user.full_name || 'Sin nombre'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-nordic-muted text-sm">{user.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    disabled={updating === user.id}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      user.role === 'admin'
                        ? 'bg-mosque/10 text-mosque border-mosque/20'
                        : 'bg-gray-100 text-nordic-dark border-gray-200'
                    }`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  {updating === user.id && (
                    <span className="ml-2 text-xs text-nordic-muted">Guardando...</span>
                  )}
                </td>
                <td className="px-6 py-4 text-nordic-muted text-sm">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
