import { getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminNavbar } from "@/components/admin/AdminNavbar";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [{ data: userRole }, { data: profile }] = await Promise.all([
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  const roles: string[] = userRole?.role ?? [];
  if (!userRole || (!roles.includes('admin') && !roles.includes('agent'))) {
    redirect(`/${locale}`);
  }

  const isAdmin = roles.includes('admin');
  const canAccessAdmin = roles.includes('admin') || roles.includes('agent');

  const userFullName = user.user_metadata?.full_name || profile?.full_name || null;

  return (
    <div className="h-screen bg-background-light flex flex-col overflow-hidden">
      <AdminNavbar 
        userEmail={user.email || undefined}
        userFullName={userFullName}
        userAvatar={user.user_metadata?.avatar_url}
        isAdmin={isAdmin}
        canAccessAdmin={canAccessAdmin}
      />
      <div className="flex-grow overflow-y-auto pt-16">
        {children}
      </div>
    </div>
  );
}
