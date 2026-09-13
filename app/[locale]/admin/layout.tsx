import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { getAdminAuth } from "@/lib/admin-auth";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const auth = await getAdminAuth();

  if (!auth.user) {
    redirect(`/${locale}/login`);
  }

  if (!auth.canAccessAdmin) {
    redirect(`/${locale}`);
  }

  // Fetch profile for display name (only if not in user metadata)
  let userFullName = auth.user.fullName;
  if (!userFullName) {
    const { createServerClient } = await import("@/lib/supabase/server");
    const supabase = await createServerClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    userFullName = profile?.full_name || null;
  }

  return (
    <div className="h-screen bg-background-light flex flex-col overflow-hidden">
      <AdminNavbar
        userEmail={auth.user.email || undefined}
        userFullName={userFullName}
        userAvatar={auth.user.avatarUrl}
        isAdmin={auth.isAdmin}
        canAccessAdmin={auth.canAccessAdmin}
      />
      <div className="flex-grow overflow-y-auto pt-16">
        <AdminAuthProvider auth={auth}>
          {children}
        </AdminAuthProvider>
      </div>
    </div>
  );
}
