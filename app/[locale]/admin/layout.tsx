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

  // Verify admin role
  const { data: userRole, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!userRole || userRole.role !== 'admin') {
    redirect(`/${locale}`);
  }

  return (
    <div className="h-screen bg-background-light flex flex-col overflow-hidden">
      <AdminNavbar 
        userEmail={user.email || undefined}
        userAvatar={user.user_metadata?.avatar_url}
      />
      <div className="flex-grow overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
        {children}
      </div>
    </div>
  );
}
