import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Admin");
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Verify admin role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!userRole || userRole.role !== 'admin') {
    redirect(`/${locale}`);
  }

  const navItems = [
    { href: "/admin", label: t("dashboard"), icon: "dashboard" },
    { href: "/admin/properties", label: t("properties"), icon: "apartment" },
    { href: "/admin/users", label: t("users"), icon: "people" },
  ];

  return (
    <div className="min-h-screen bg-background-light flex">
      {/* Sidebar */}
      <aside className="w-64 bg-nordic-dark text-white flex-shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-mosque flex items-center justify-center">
              <span className="material-icons text-white text-lg">apartment</span>
            </div>
            <span className="text-lg font-semibold">LuxeEstate</span>
          </Link>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <span className="material-icons text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 w-64 p-6 border-t border-white/10">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-icons">arrow_back</span>
            <span>{t("back_to_site")}</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
